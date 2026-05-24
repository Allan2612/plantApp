# Scan → Jardín: Mejora UI/UX y Flujo

**Fecha:** 2026-05-19  
**Scope:** `mobile/src/features/identificar` + `mobile/src/features/mis-plantas`  
**Objetivo:** Mejorar la experiencia completa desde que el usuario escanea una planta hasta que la ve en su jardín, incluyendo el jardín mismo.

---

## Problemas actuales

1. **Post-guardar sin feedback**: después de guardar desde el scan solo aparece un toast y la pantalla queda vacía.
2. **Guardar sin customización**: `handleSavePlant` crea la planta inmediatamente sin permitir editar nickname ni ubicación.
3. **Campo imagen como URL de texto**: en Mis Plantas el usuario debe escribir una URL manualmente para la imagen.
4. **`IdentificarPhotoPreview` monolítico**: todos los estados (idle, analyzing, result, no-plant) son ramas de un solo render largo en ScrollView.
5. **Cards del jardín simples**: grid 2col con texto plano, sin indicador visual de salud, sin detalle de planta.
6. **Sin pantalla de detalle**: editar abre un modal largo; no existe vista de detalle de una planta.
7. **Empty state débil**: dos botones planos sin ilustración ni copy motivador.

---

## Arquitectura del nuevo flujo

```
[IdentificarEmptyState] → [Camera modal] → [PhotoPreview:idle]
    → [PhotoPreview:analyzing] → [PhotoPreview:result-plant]
    → [SavePlantSheet] → [PhotoPreview:saved]
    → navega a /(tabs)/misplantas?highlight=<id>
```

---

## Sección 1: Flujo de Escaneo

### 1.1 `IdentificarPhotoPreview` — estados explícitos

Refactorizar el componente para manejar 4 estados mutuamente excluyentes:

| Estado | Trigger | Contenido |
|---|---|---|
| `idle` | foto capturada, sin resultado | foto + input descripción + botón "Analizar" |
| `analyzing` | `isIdentifying === true` | foto + overlay animado bloqueante + texto |
| `result-plant` | `aiResult.isPlant === true` | card resultado + botón "Guardar en Mi Jardín" |
| `result-no-plant` | `aiResult.isPlant === false` | card error + botón "Intentar otra foto" |
| `saved` | post-guardar exitoso | icono check animado + CTA jardín + CTA nueva |

Transiciones entre estados con `Animated.FadeIn/FadeOut` (Reanimated, ya disponible vía Expo).

Pre-análisis local (`detections`) se mueve a un `<Collapsible>` secundario en estado `idle` — no visible por defecto para no saturar la pantalla.

### 1.2 `SavePlantSheet` (nuevo componente)

Bottom sheet que aparece al tocar "Guardar en Mi Jardín" en estado `result-plant`.

**Props:**
- `aiResult: PlantIdentificationResult`
- `capturedPhotoUri: string`
- `onSave: (data: SavePlantData) => Promise<void>`
- `onClose: () => void`

**Contenido:**
- Thumbnail de `capturedPhotoUri` (80×80, borderRadius)
- Campo nickname (pre-llenado con `aiResult.commonName`, editable)
- Campo ubicación (opcional, placeholder "Sala, balcón, ventana sur...")
- Botón "Añadir al jardín" → llama `onSave` → cierra sheet → estado `saved`

**`SavePlantData`:**
```ts
interface SavePlantData {
  nickname: string;
  locationHome?: string;
}
```

### 1.3 Estado `saved` en `IdentificarPhotoPreview`

Reemplaza el toast de éxito. Muestra:
- Icono check con animación bounce (Animated scale 0→1.2→1)
- Texto "¡{nombre} agregada a tu jardín!"
- Botón primario "Ver en mi jardín" → navega a `/(tabs)/misplantas?highlight=<id>`
- Botón secundario "Identificar otra planta" → limpia estado

### 1.4 `IdentificarEmptyState` — mejorar

- Ícono grande de cámara+hoja (Ionicons `camera-outline` + `leaf-outline` superpuestos, o ilustración SVG)
- Título: "Identifica tu planta"
- Subtítulo: "Usa IA para reconocer cualquier planta y agregarla a tu jardín"
- Botón primario: "Tomar foto"
- Link secundario: "Elegir de galería"

---

## Sección 2: Mi Jardín

### 2.1 Cards rediseñadas — layout horizontal

Cambiar de grid 2 columnas a lista de cards 1 columna, layout horizontal imagen+info:

```
┌─────────────────────────────────────┐
│ [img]  Monstera grande              │
│ 80×80  Monstera deliciosa   ● Verde │
│        📍 Sala          [Ver] [✏️]  │
└─────────────────────────────────────┘
```

- Badge salud con color: verde (`healthy`), amarillo (`needs_attention`), rojo (`sick`)
- Chip de ubicación si `locationHome` existe
- Dos acciones: "Ver" → detalle, icono lápiz → sheet edición
- Imagen: foto del usuario (`customImageUrl`) con fallback a imagen de catálogo

### 2.2 `PlantDetailScreen` (nueva pantalla)

Ruta: `app/(tabs)/misplantas/[id].tsx`

Secciones:
- **Hero**: imagen full-width (aspect 16:9), nombre grande, nombre científico en italic
- **Cuidados** (datos del catálogo): agua, luz, dificultad, toxicidad con iconos
- **Mi planta**: nickname, ubicación, fecha adquisición, notas
- **Acciones**: botón "Editar" → abre sheet edición, botón "Eliminar" (con confirmación)

### 2.3 FAB para añadir

Reemplazar botón "Añadir a mi jardín" del header por FAB fijo abajo a la derecha:
- Tamaño 56×56, color `colors.primary`
- Icono `add-outline`
- Posición: `bottom: spacing.xl, right: spacing.md`
- Al tocar → abre bottom sheet de creación

### 2.4 Header simplificado

- Solo: título "Mi jardín" + caption con contador `(N plantas)`
- Stats row: Total / Saludables / Favoritas (nuevo) / Catálogo

### 2.5 Highlight de planta nueva

`MisPlantasScreen` lee `highlight` de `useLocalSearchParams()`. Card con ese ID:
- Borde `colors.primary` de 2px
- Fondo ligeramente teñido
- Animación: fade in del borde en 300ms, desaparece a los 2s

---

## Sección 3: Imagen + Conexión transversal

### 3.1 `PlantImagePicker` (nuevo componente compartido)

Reemplaza `TextInput` de `customImageUrl` en formularios de crear/editar.

**Comportamiento:**
- Sin imagen: botón "Agregar foto" con icono cámara
- Con imagen: preview 100% width (aspect 4:3) con botón de overlay "Cambiar"
- Toca → `ActionSheet` (Alert nativo) con opciones: "Tomar foto" / "Elegir de galería" / "Eliminar foto"
- Usa `expo-image-picker` (ya instalado)
- Retorna URI local; el backend recibe la URI y la maneja igual que hoy

**Props:**
```ts
interface PlantImagePickerProps {
  value: string | null;
  onChange: (uri: string | null) => void;
}
```

### 3.2 Pre-llenado desde scan

`SavePlantSheet` recibe `capturedPhotoUri` y lo pasa como `value` inicial del `PlantImagePicker` interno. La imagen de la foto escaneada se usa automáticamente como foto de la planta.

### 3.3 Navegación post-guardar

`handleSavePlant` (o equivalente en `SavePlantSheet`) después de éxito:
```ts
router.push(`/(tabs)/misplantas?highlight=${savedPlantId}`);
```

---

## Archivos a crear

| Archivo | Descripción |
|---|---|
| `src/features/identificar/components/SavePlantSheet/SavePlantSheet.tsx` | Bottom sheet confirmación pre-guardar |
| `src/features/mis-plantas/screens/PlantDetailScreen/PlantDetailScreen.tsx` | Pantalla detalle planta |
| `src/components/shared/PlantImagePicker/PlantImagePicker.tsx` | Picker de imagen compartido |
| `app/(tabs)/misplantas/[id].tsx` | Ruta dinámica detalle |

## Archivos a modificar

| Archivo | Cambio principal |
|---|---|
| `src/features/identificar/components/IdentificarPhotoPreview/IdentificarPhotoPreview.tsx` | Estados explícitos + animaciones + estado saved |
| `src/features/identificar/components/IdentificarEmptyState/` | Ilustración + copy nuevo |
| `src/features/identificar/hooks/useIdentificarScreen.ts` | SavePlantSheet flow, navega post-save |
| `src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx` | Cards horizontales, FAB, highlight param, stats |
| `src/features/mis-plantas/hooks/useMisPlantasScreen.ts` | Soporte imagen local en crear/editar |

---

## Restricciones

- No instalar dependencias nuevas — usar `expo-image-picker`, Reanimated, Expo Router ya disponibles.
- Mantener compatibilidad con modo offline (botones deshabilitados con mensaje claro).
- No cambiar el backend API — solo el frontend.
- `PlantDetailScreen` usa datos ya cargados en el store de mis-plantas, no hace fetch adicional.
