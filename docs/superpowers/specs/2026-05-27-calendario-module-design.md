# Módulo Calendario — Diseño

Fecha: 2026-05-27
Estado: Aprobado para implementación

## Objetivo

Implementar el módulo de calendario de cuidados de plantas en `plantApp`. Reemplazar el `PlaceholderScreen` actual con un calendario funcional integrado con la IA de identificación: cuando el usuario agrega una planta al jardín, la IA devuelve los cuidados recomendados; esos cuidados se persisten como reglas y materializan tareas concretas en el calendario, con notificaciones locales para recordatorios.

## Alcance

Incluido:
- Vista mes-grid + agenda del día seleccionado
- Crear/editar/borrar tareas manualmente
- Auto-generación de tareas desde reglas de cuidado por planta (`careRules`)
- Pre-llenado de reglas desde IA al guardar planta
- Notificaciones locales (`expo-notifications`)
- Soporte offline con cola de mutaciones

Fuera de scope (futuro):
- Cron job global de materialización
- Estadísticas/streaks
- Plantas compartidas multi-usuario
- Cascade delete de reglas al eliminar planta
- Reordenamiento por drag-and-drop

## Arquitectura

```
[Identificar IA] → PlantIdentificationResponse (+ care_schedule[])
                       ↓
[SavePlantSheet]  → POST /api/user-plants { ..., careRules }
                       ↓
[Backend]         → crea userPlant + careRules + materializa careSchedule +30d
                       ↓
[Mobile Calendar] → GET /api/users/{uid}/care-schedule?from=&to=
                       ↓ (con materialize_pending_tasks llamada en el GET)
[Local notifs]    → syncNotifications(tasks)
                       ↓
[Completar tarea] → POST /api/care-schedule/{id}/complete
                       → careHistory + next task + cancel/reschedule notif
```

Capas:
- **Backend FastAPI/Firestore**: colecciones `careRules`, `careSchedule`, `careHistory`. Servicio `care_engine.py`.
- **Mobile Expo**: feature `calendario/` (screens, components, hooks, services, store, utils). Zustand + AsyncStorage offline.
- **IA Groq**: prompt extendido devuelve `care_schedule` estructurado.

## Modelos de datos

### Backend `app/models.py` (nuevos)

```python
class CareRuleModel(FirestoreBaseModel):
    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    intervalDays: int
    notes: str | None = None
    anchorDate: str
    lastGeneratedUntil: str | None = None
    active: bool = True

class CareRuleInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    intervalDays: int
    notes: str | None = None
    anchorDate: str | None = None

class CompleteCareTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    completedAt: str | None = None
    notes: str | None = None
    value: str | None = None

class CreateCareTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    scheduledFor: str
    notes: str | None = None

class UpdateCareTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scheduledFor: str | None = None
    notes: str | None = None
    status: Literal["pending", "completed", "skipped"] | None = None
```

### Cambios a modelos existentes

```python
class CreateUserPlantRequest(BaseModel):
    # campos existentes
    careRules: list[CareRuleInput] | None = None

class PlantIdentificationResponse(BaseModel):
    # campos existentes
    care_schedule: list[CareRuleInput] = []

class CareScheduleItemModel(FirestoreBaseModel):
    # campos existentes
    ruleId: str | None = None  # enlace a regla origen (nullable para tareas manuales)
```

### Firestore collections

- `careRules/{ruleId}` — reglas activas por planta
- `careSchedule/{taskId}` — tareas materializadas (existente; añadir `ruleId`)
- `careHistory/{entryId}` — registro completado (existente, sin cambios)

## Endpoints

### Nuevos

```
GET    /api/user-plants/{user_plant_id}/care-rules     → list[CareRuleModel]
POST   /api/user-plants/{user_plant_id}/care-rules     → CareRuleModel
PATCH  /api/care-rules/{rule_id}                       → CareRuleModel
DELETE /api/care-rules/{rule_id}                       → {ok: true}

POST   /api/care-schedule                              → CareScheduleItemModel (manual)
PATCH  /api/care-schedule/{task_id}                    → CareScheduleItemModel
DELETE /api/care-schedule/{task_id}                    → {ok: true}
POST   /api/care-schedule/{task_id}/complete           → {task, history, next}
```

### Modificado

```
GET /api/users/{user_id}/care-schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
  → llama materialize_pending_tasks(user_id, horizon=30) antes de devolver
  → filtra por rango si from/to presentes
```

`POST /api/user-plants` extendido: si `careRules` no vacío, crea reglas + materializa tareas iniciales.

## Servicios backend

### `app/services_care.py` (nuevo módulo)

```python
def create_care_rules_for_plant(user_id, user_plant_id, rules: list[CareRuleInput]) -> list[CareRuleModel]
    # Inserta cada regla. anchorDate default = hoy (ISO). lastGeneratedUntil = None.

def materialize_pending_tasks(user_id: str, horizon_days: int = 30) -> int
    # Para cada careRule activa del user:
    #   start = max(lastGeneratedUntil, anchorDate)
    #   end = today + horizon_days
    #   generar fechas (intervalDays steps) entre start y end
    #   upsert idempotente en careSchedule: doc id = `${ruleId}_${scheduledFor}` para evitar duplicados
    #   actualizar lastGeneratedUntil = end
    # Retorna count tareas creadas.

def complete_care_task(task_id, completed_at, notes, value) -> dict
    # Marca task status=completed, crea entry en careHistory.
    # Si task.ruleId presente y regla active:
    #   crea próxima tarea pending con scheduledFor = completedAt + intervalDays
    # Retorna {task, history, next?}

def update_care_rule(rule_id, payload) -> CareRuleModel
    # Actualiza campos; si intervalDays o anchorDate cambian:
    #   borra tareas pending futuras (scheduledFor > now AND status=pending) con esa ruleId
    #   re-materializa

def delete_care_rule(rule_id) -> None
    # Soft delete: active=False, borra tareas pending futuras de esa regla.
```

### Validación IA `services_ai.py`

Post-parse `care_schedule`:
- Filtra items con `type` no válido
- Clamp `intervalDays` ∈ [1, 365]; descarta si ausente o no numérico
- `notes` opcional, trim string

## UI Mobile

### Estructura `mobile/src/features/calendario/`

```
calendario/
  screens/CalendarioScreen/
    CalendarioScreen.tsx
    styles.ts
    index.ts
  components/
    MonthGrid/                  # grid 7x6 con dots por día
    DayAgenda/                  # lista tareas día seleccionado
    TaskCard/                   # item swipeable complete/skip
    AddTaskSheet/               # bottom sheet crear tarea manual
    EditRulesSheet/             # gestionar reglas de una planta
    EmptyDayState/
  hooks/
    useCalendarioScreen.ts
    useMonthTasks.ts            # memoiza tareas por día del mes
    useCompleteTask.ts
  services/
    calendarApi.service.ts
    localNotifications.service.ts
  store/
    calendario.feature.store.ts
  utils/
    careTypes.ts                # icon/label/color por type
    dateRange.ts                # helpers ISO/local
```

### Layout pantalla principal

```
┌────────────────────────────────┐
│ ◀  Mayo 2026  ▶          [+]   │
├────────────────────────────────┤
│ L  M  M  J  V  S  D            │
│ .  .  1  2  3  4  5            │
│ 6  7  8  9 10 11 12            │
│13 14 [15•] 16 17 18 19         │
│20 21 22 23 24 25 26            │
│27 28 29 30 31  .  .            │
├────────────────────────────────┤
│ Tareas del 15 mayo             │
│ ┌────────────────────────────┐ │
│ │💧 Regar  Monstera   pend.  │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │🌱 Abonar Pothos    ✓ hecho │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Mapeo type → presentación (`careTypes.ts`)

| type | icon Ionicons | color | label |
|---|---|---|---|
| watering | `water-outline` | `#3b82f6` | Regar |
| fertilizing | `nutrition-outline` | `#10b981` | Abonar |
| pruning | `cut-outline` | `#f59e0b` | Podar |
| rotation | `refresh-outline` | `#8b5cf6` | Rotar |

### Integración SavePlantSheet (`identificar/`)

Tras identificación IA:
- Estado local `careRules: CareRuleInput[]` inicializado desde `aiResult.care_schedule`
- Sección "Cuidados sugeridos" con chips editables (tap edita intervalDays + notas; long-press elimina)
- Botón "+ Agregar cuidado" abre selector type/intervalo
- Submit incluye `careRules` en `POST /api/user-plants`

### Integración PlantDetailScreen

Botón "Cuidados programados" abre `EditRulesSheet` para esa planta (CRUD de reglas).

## Store + offline

### `calendario.feature.store.ts` (Zustand)

```typescript
interface CalendarioState {
  selectedDate: string;                      // ISO YYYY-MM-DD
  visibleMonth: { year: number; month: number };
  tasks: CareScheduleItem[];
  rules: Record<string, CareRule[]>;         // key = userPlantId
  isLoading: boolean;
  setSelectedDate: (d: string) => void;
  setVisibleMonth: (y: number, m: number) => void;
  setTasks: (t: CareScheduleItem[]) => void;
  upsertTask: (t: CareScheduleItem) => void;
  removeTask: (id: string) => void;
  setRulesForPlant: (plantId: string, rules: CareRule[]) => void;
}
```

### Cache offline (vía `offlineCache.ts` existente)

- `calendar.tasks.{userId}` → array tareas
- `calendar.rules.{userPlantId}` → array reglas
- Hidratación: lee cache → render → fetch red → reemplaza

### Cola mutaciones offline

- `calendar.queue.{userId}` → array `{action: 'create'|'update'|'delete'|'complete', payload, timestamp}`
- Encolar cuando `isConnected === false`
- Drenar al reconectar (hook `useNetworkStatus`)
- Política: 1 retry por item, descarte con toast si vuelve a fallar

## Notificaciones locales

### `localNotifications.service.ts`

```typescript
ensurePermissions(): Promise<boolean>
scheduleTaskNotification(task: CareScheduleItem): Promise<string | null>
  // identifier = task.id
  // trigger = scheduledFor a las 09:00 hora local
  // body = `${typeLabel} ${plantNickname}`
cancelTaskNotification(taskId: string): Promise<void>
syncNotifications(tasks: CareScheduleItem[]): Promise<void>
  // cancela todas, reprograma pending futuras
```

Permisos pedidos primera vez que se abre Calendario o se guarda planta con reglas. App funciona sin notificaciones si denegados.

### Config `app.json`

```json
"plugins": [
  ["expo-notifications", {
    "icon": "./assets/notification-icon.png",
    "color": "#22c55e"
  }]
]
```

Requiere build dev-client (no Expo Go).

## Cambios IA (`services_ai.py`)

Extender `_IDENTIFICATION_PROMPT` con bloque obligatorio:

```
"care_schedule": [
  {"type": "watering", "intervalDays": 3, "notes": "Cuando sustrato esté seco 3cm"},
  {"type": "fertilizing", "intervalDays": 30, "notes": "NPK balanceado primavera/verano"}
]
```

Reglas extra:
- `type` ∈ `["watering","fertilizing","pruning","rotation"]`
- `intervalDays` entero 1-365
- Incluir solo cuidados aplicables; no forzar 4
- `is_plant=false` ⇒ `care_schedule: []`

`max_tokens` sube a 1536.

## Testing

### Backend (pytest, mock Firestore)

- `test_materialize_pending_tasks_idempotent` — 2 llamadas no duplican
- `test_complete_task_creates_history_and_next` — próxima task con `scheduledFor = completedAt + intervalDays`
- `test_update_rule_regenerates_future_pending` — cambiar interval borra futuras + re-materializa
- `test_delete_rule_keeps_past_history` — desactivar no borra history ni completed
- `test_care_rules_validation` — `intervalDays` fuera de rango rechazado
- `test_create_user_plant_with_rules` — crea plant + rules + tasks en una llamada

### Mobile (jest + RTL)

- `useMonthTasks` agrupa correctamente por día
- `localNotifications.syncNotifications` cancela + reprograma sin duplicar
- Cola offline drena en orden + descarte tras retry fallado
- `careTypes` mapping completo para los 4 types

### Manual / dev-server

- Agregar planta con `care_schedule` IA → tareas aparecen en mes actual
- Tap día sin tareas → empty state
- Completar tarea → pending desaparece, check aparece, próxima se crea
- Modo avión: crear tarea manual → reconectar → se sube
- Permisos notif denegados → app no crashea, calendario funciona

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Cuota Groq aumenta con prompt mayor | `max_tokens=1536`, monitor logs |
| Drift zona horaria | `scheduledFor` ISO UTC; render local; notif fija 09:00 local |
| Reglas huérfanas al borrar planta | Cascade delete en endpoint delete user-plant (fuera de scope, documentado) |
| `expo-notifications` requiere dev-client en iOS | Documentar en README; no Expo Go |
| Materialización N*M*30 lenta | Solo materializar para `user_id` solicitante; batch writes Firestore; idempotencia por doc-id determinista |

## Plan de build (orden sugerido)

1. Backend: modelos + `services_care.py` + endpoints care-rules y care-schedule (incluye `ruleId` en `careSchedule`)
2. Backend: extender `POST /api/user-plants` con `careRules`
3. Backend: extender prompt IA + `PlantIdentificationResponse.care_schedule`
4. Mobile: feature folder + store + services + utils
5. Mobile: `CalendarioScreen` + `MonthGrid` + `DayAgenda` + `TaskCard`
6. Mobile: `AddTaskSheet` + `EditRulesSheet`
7. Mobile: cache offline + cola mutaciones
8. Mobile: `localNotifications` + permisos + `syncNotifications`
9. Mobile: integrar `SavePlantSheet` para enviar `careRules`
10. Mobile: integrar `PlantDetailScreen` → `EditRulesSheet`
11. Tests backend + mobile
12. Verificación manual flujos end-to-end
