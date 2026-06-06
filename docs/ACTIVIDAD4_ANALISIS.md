# Actividad 4 — Plantica (App de plantas con IA)

**Estudiante:** Alan Vargas Torres
**Fecha de entrega:** 27/05/2026
**Repositorio:** https://github.com/Alan2612/plantApp
**API en Render:** https://plantapp-jjh7.onrender.com

---

## Parte 1 — Investigación y análisis

### 1.1 Identificación de módulos faltantes

Antes de iniciar esta actividad la aplicación ya cubría: identificación de plantas con IA (Groq Llama 4 Scout vision), catálogo público con likes/comentarios, mi-jardín (con healthStatus, edición y subida de imagen), perfiles públicos, autenticación Firebase y soporte offline básico con AsyncStorage.

Tras auditar el flujo de usuario se detectaron los siguientes huecos:

| Módulo faltante | Estado previo | Impacto en la app |
|---|---|---|
| **Calendario de cuidados** | Sólo placeholder visual en el tab | El usuario no podía planificar riegos, fertilizaciones, podas ni rotaciones |
| **Reglas de cuidado por planta (`careRules`)** | No existían | No había forma de derivar tareas recurrentes a partir de los consejos de la IA |
| **Materialización de tareas (`careSchedule`)** | Modelo existía pero nunca se poblaba | Tareas vacías permanentemente |
| **Historial de cuidado (`careHistory`)** | Modelo existía sin endpoints de escritura | No se podía registrar cumplimiento ni rachas |
| **Notificaciones locales** | No instaladas | El usuario olvidaba sus cuidados |
| **Sincronización offline para tareas** | Sólo lectura cacheada en otras vistas | Acciones nuevas en avión se perdían |
| **Datos de contacto del usuario (teléfono)** | Sólo nombre/usuario/ciudad | No existía canal de contacto entre usuarios del catálogo |
| **Refresco automático al publicar / comentar** | Requería recarga manual | UX rota: el usuario dudaba si la acción funcionó |

Con estos hallazgos la app estaba estimada **≈ 70 %** funcional. Esta actividad la lleva a **≥ 90 %** al cerrar el ciclo de "identificar → guardar → recordar → cumplir → registrar".

### 1.2 Funcionalidad propia diferenciadora

**Generación automática de calendario de cuidados desde la IA.**

A diferencia de un calendario manual genérico (que se ve en la mayoría de apps de plantas), cuando el usuario identifica una planta con la IA, ésta no sólo devuelve un nombre y una descripción: también devuelve un `care_schedule` estructurado con frecuencias en días para los cuidados aplicables a esa especie (`watering`, `fertilizing`, `pruning`, `rotation`) y notas breves. Al guardar la planta, el backend:

1. Persiste cada cuidado como una `careRule` (regla recurrente).
2. **Materializa idempotentemente las próximas tareas (`careSchedule`)** durante los siguientes 30 días.
3. Programa una notificación local para cada tarea pendiente (09:00 hora local del día de la tarea, vía `expo-notifications`).
4. Cuando el usuario completa una tarea, registra `careHistory` y **genera automáticamente la próxima ocurrencia** sumando `intervalDays` a la fecha de cumplimiento real (no a la planificada).

**Por qué aporta valor:**
- **Cero fricción para el usuario novato.** No tiene que decidir cada cuántos días regar una Monstera o un Pothos: la IA ya lo sabe y la app se lo agenda.
- **Aprende del comportamiento real.** Si el usuario riega tarde, la próxima recordatorio se desplaza para mantener el intervalo desde el último riego, no desde una fecha rígida del calendario.
- **Idempotencia y offline.** La función `materialize_pending_tasks` usa doc-id determinista `{ruleId}_{YYYY-MM-DD}` en Firestore, así múltiples llamadas o reintentos nunca duplican tareas. Las mutaciones offline se encolan en AsyncStorage y se drenan al reconectar.
- **Integración total con la vista del catálogo.** El conocimiento botánico de la IA se materializa en producto: lo que antes era "información estática que el usuario tenía que recordar" ahora es "tareas accionables en su tab calendario".

Esta funcionalidad **diferencia la app** porque convierte la IA en un asistente proactivo de jardinería, no sólo en un identificador. Es decir, la IA deja de ser una herramienta de un solo uso (¿qué planta es?) y pasa a ser el motor que estructura toda la rutina de cuidado del usuario durante semanas.

---

## Parte 2 — Desarrollo

### 2.1 Módulos faltantes desarrollados

**Backend (FastAPI + Firestore + Pydantic v2)**

Nuevos modelos en `app/models.py`:
- `CareRuleModel`, `CareRuleInput` — regla recurrente y su DTO de entrada.
- `CreateCareTaskRequest`, `UpdateCareTaskRequest`, `CompleteCareTaskRequest` — DTOs para tareas manuales y completado.
- `CareScheduleItemModel.ruleId` (campo añadido) — enlaza tarea a regla origen para regeneración.
- `PlantIdentificationResponse.care_schedule` — agrega el campo estructurado que devuelve la IA.
- `CreateUserPlantRequest.careRules` — permite enviar las reglas al crear planta.
- `UserModel.phone`, `PublicUserModel.phone`, `UpdateUserRequest.phone` — teléfono del usuario.

Nuevo módulo `app/services_care.py` con motor de calendario:
- `create_care_rules_for_plant(user_id, user_plant_id, rules)` — persiste reglas.
- `materialize_pending_tasks(user_id, horizon_days=30)` — genera tareas pending idempotente, usando doc-id `{ruleId}_{YYYY-MM-DD}` y `lastGeneratedUntil` para no duplicar.
- `complete_care_task(task_id, completed_at, notes, value)` — marca completed, crea `careHistory`, regenera próxima.
- `update_care_rule` + `delete_care_rule` — mutaciones que regeneran o borran tareas futuras pending preservando historial.
- `create_manual_care_task`, `update_care_task`, `delete_care_task`, `list_care_rules_for_plant` — CRUD complementario.

9 endpoints nuevos en `app/routes.py`:
```
GET    /api/user-plants/{user_plant_id}/care-rules
POST   /api/user-plants/{user_plant_id}/care-rules
PATCH  /api/care-rules/{rule_id}
DELETE /api/care-rules/{rule_id}
POST   /api/care-schedule
PATCH  /api/care-schedule/{task_id}
DELETE /api/care-schedule/{task_id}
POST   /api/care-schedule/{task_id}/complete
GET    /api/users/{user_id}/care-schedule       (modificado: ahora materializa + acepta from_date/to_date)
```

Adicionalmente:
- `create_user_plant` extendido para procesar `careRules` y materializar tareas iniciales en una sola llamada.
- `services_ai.py` extendido: prompt incluye `care_schedule` en la respuesta esperada con reglas estrictas (tipos válidos, `intervalDays` 1-365, opcional `notes`); validación post-parse en Python filtra entradas inválidas y aplica clamp.
- `max_tokens` del modelo Groq subido a 1536.
- Suite de tests con `pytest` + un `FakeFirestore` en memoria (`tests/conftest.py`) — **20 tests pasando** cubriendo modelos, motor de calendario, validación de IA y flujo integrado de creación de planta con reglas.
- Queries con composite-index requirements re-escritas para hacer un solo `.where()` en Firestore y filtrar el segundo campo en Python (evita el error "The query requires an index" sin necesidad de crear índices manuales en consola).

**Mobile (Expo SDK 54 + React Native 0.81 + Zustand + AsyncStorage + expo-notifications)**

Nueva feature `mobile/src/features/calendario/`:
- `types.ts` — interfaces compartidas (`CareScheduleItem`, `CareRule`, `CareRuleInput`, `CompleteTaskResult`, `QueuedAction`).
- `store/calendario.feature.store.ts` — store Zustand con `tasks`, `rulesByPlant`, `selectedDate`, `visibleMonth`.
- `services/calendarApi.service.ts` — 9 wrappers tipados a los endpoints REST.
- `services/calendarOffline.service.ts` — cache de tareas + cola de mutaciones (`create`/`update`/`delete`/`complete`).
- `services/localNotifications.service.ts` — `expo-notifications` con carga perezosa que se omite automáticamente en Expo Go (incompatible con SDK 53+).
- `utils/careTypes.ts`, `utils/dateRange.ts` — meta visual por tipo (icono, color, label) + utilidades de fecha.
- `screens/CalendarioScreen` — header de navegación mensual, `MonthGrid` (grid 7x6 con dots por tipo de tarea), `DayAgenda` (lista de tareas del día seleccionado), FAB de añadir.
- `components/`:
  - `MonthGrid` — calendario visual.
  - `DayAgenda` + `TaskCard` — agenda diaria con botón completar.
  - `AddTaskSheet` — modal para crear tarea manual.
  - `EditRulesSheet` — modal de gestión de reglas de una planta.
- `hooks/`:
  - `useCalendarioScreen` — orquesta carga, cache, notificaciones y permisos.
  - `useMonthTasks` — memoiza tareas agrupadas por día.
  - `useCompleteTask` — completar con optimistic update + offline queue.
  - `useQueueDrainer` — drena la cola al recuperar conexión.

Integraciones con features existentes:
- `SavePlantSheet` (en identificar): muestra los cuidados sugeridos por IA como chips editables; el usuario puede quitar los que no quiera y luego se envían como `careRules` al crear la planta.
- `PlantDetailScreen` (en mi-jardín): nuevo botón "Cuidados programados" que abre `EditRulesSheet` para esa planta.
- Tras guardar planta + publicar al catálogo, `useIdentificarScreen` refresca explícitamente la cache de plantas y catálogo y empuja al store global, de modo que ambas pantallas (Mi Jardín y Catálogo) muestran inmediatamente los cambios sin recargar.

**Calidad de vida (fixes UX importantes)**

- `commentCount` en cards del catálogo se actualiza al añadir/eliminar un comentario sin necesidad de pull-to-refresh. Esto fluye desde `PlantCommentsSheet` → `CatalogoScreen` (o `PublicProfileScreen`) → `useCatalogo` / `usePublicProfile` vía `adjustCommentCount(plantId, delta)`.
- `useCatalogo` añade `useFocusEffect` para recargar al volver al tab tras publicar una nueva planta.
- `EditRulesSheet`: el selector Zustand sobre `rulesByPlant[plantId] ?? []` se memoiza con `useMemo` para evitar referencia nueva en cada render (corregido bug "infinite loop / getSnapshot should be cached").

**Datos de usuario — teléfono**

- Backend: `phone` en `UserModel`, `PublicUserModel`, `UpdateUserRequest`. `update_user_fields` lo acepta. `sync_user_from_auth` lo inicializa vacío. `get_public_user_profile` lo expone.
- Mobile: añadido en `BackendUser`, `UpdateUserPayload`, `PublicUserProfile`.
- Registro (`RegisterScreen` + `useRegisterRoute`): nuevo input "Telefono" con validación (entre 8-20 dígitos, permite espacios, `+`, `()`, `-`), requerido al crear cuenta.
- `UserProfileScreen`: visible en modo lectura ("Teléfono: …") y editable como `InputText` con `keyboardType="phone-pad"`.
- `PublicProfileScreen`: cuando el usuario tiene teléfono, se muestra con icono `call-outline` debajo de ciudad/headline.

### 2.2 Funcionalidad propia desarrollada

Como se describe en 1.2: motor de calendario auto-generado desde la IA. Comparte el módulo `services_care.py` (backend), la feature `calendario/` (mobile), la integración con `SavePlantSheet` y las notificaciones locales. Se valida con 11 tests dedicados (`tests/test_services_care.py`) y 3 tests sobre la validación del schedule en la respuesta de IA (`tests/test_services_ai.py`).

---

## Parte 3 — Entrega

- **PDF de análisis:** este mismo documento exportado a PDF.
- **Repositorio:** https://github.com/Alan2612/plantApp (rama `develop`).
- **API en Render:** https://plantapp-jjh7.onrender.com — compartida con los correos solicitados.
- **Tests automatizados:** `cd backend-api && .venv\Scripts\python -m pytest -v` → 20 passed.
- **Verificación manual sugerida:**
  1. Registrar usuario nuevo con teléfono → ir a perfil → editar teléfono → ver el campo en el perfil público.
  2. Identificar una planta con la cámara → confirmar chips de cuidados sugeridos → guardar.
  3. Abrir tab Calendario → ver dots en días donde se materializaron tareas → tap día → completar una tarea → verificar que la próxima aparece automáticamente.
  4. Pull-to-refresh en mi-jardín tras publicar → la planta nueva aparece sin reiniciar.
  5. Añadir/eliminar comentarios en una publicación → ver el contador actualizado al instante.

---

## Conclusión

La aplicación alcanza ahora **≥ 90 %** de funcionalidad útil para un escenario real de cuidado de plantas en hogar. La diferenciación principal respecto a otras apps similares es que la IA no sólo identifica: alimenta el motor de calendario, lo que cierra el ciclo completo "identificar → planificar → recordar → cumplir → registrar" sin trabajo manual del usuario.
