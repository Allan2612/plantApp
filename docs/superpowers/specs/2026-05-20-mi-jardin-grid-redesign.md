# Mi Jardín — Rediseño Grid Visual

**Fecha:** 2026-05-20
**Scope:** `mobile/src/features/mis-plantas/screens/MisPlantasScreen` + nuevo componente `PlantGridCard`
**Objetivo:** Reemplazar la lista horizontal de cards por un grid visual 2 columnas estilo Pinterest, minimalista, compatible con tema claro y oscuro.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Estilo | Minimalista, blanco/negro, compatible con dark+light themes |
| Layout | Grid 2 columnas |
| Imagen card | Aspect 3:4, nombre encima con overlay semitransparente |
| Stats row | Eliminado |
| Interacción card | Tap → `PlantDetailScreen` directamente |
| Editar | Solo desde `PlantDetailScreen` (sin botón en card) |
| FAB | Sin cambios |
| Modales crear/editar | Sin cambios |

---

## Arquitectura

### Nuevo componente: `PlantGridCard`

Ruta: `mobile/src/features/mis-plantas/components/PlantGridCard/`

Responsabilidad única: renderizar una planta en formato visual de grid. Recibe los datos ya procesados (no hace lookups).

**Props:**
```ts
interface PlantGridCardProps {
  nickname: string;
  imageUri: string | null;
  health: "good" | "regular" | "bad";
  isHighlighted?: boolean;
  onPress: () => void;
}
```

`isHighlighted` aplica borde `colors.primary` 2px al card. `MisPlantasScreen` maneja el estado: lee `highlight` de `useLocalSearchParams`, pasa `isHighlighted={highlight === id}` al card, y usa `setTimeout(2000)` + `useState` para limpiar el param después de 2s (no Reanimated).

**Layout:**
```
┌──────────────────────────┐
│                          │  ← expo-image aspect 3:4, contentFit=cover
│                          │
│      [● dot top-right]   │  ← health dot, 10×10, borde blanco 2px
│                          │
│██████████████████████████│  ← View overlay rgba(0,0,0,0.55), height 45%
│  Monstera grande         │  ← AppText label, color #FFFFFF, paddingH sm
└──────────────────────────┘
```

- `Pressable` envuelve todo el card
- `overflow: "hidden"`, `borderRadius: radius.lg`
- Fallback sin imagen: `View` con `colors.surfaceAlt` + `Ionicons "leaf-outline"` centrado
- Health dot colores:
  - `good` → `#22c55e`
  - `regular` → `#f59e0b`
  - `bad` → `#ef4444`

---

## MisPlantasScreen — nueva estructura

### Cambios vs versión anterior

| Elemento | Antes | Después |
|---|---|---|
| Lista | `ScrollView` + `View` list | `FlatList` con `numColumns={2}` |
| Cards | `HighlightCard` + card horizontal | `PlantGridCard` |
| Stats | Fila de 4 summary cards | Eliminado |
| Header | Título + count | Solo título + count (mismo) |
| `HighlightCard` | Presente | Eliminado |
| Importaciones | `Animated`, `useSharedValue`, etc. | Removidas si sin highlight |

> **Nota highlight:** El param `?highlight=<id>` sigue siendo leído desde `useLocalSearchParams` pero la animación de borde se simplifica: la card destacada recibe un borde `colors.primary` de 2px estático (sin animación Reanimated) que desaparece después de 2s via `setTimeout` + `useState`. Esto elimina la dependencia de Reanimated en esta pantalla.

### Layout FlatList

```tsx
<FlatList
  data={plants}
  numColumns={2}
  keyExtractor={(item) => getUserPlantId(item)}
  renderItem={({ item }) => <PlantGridCard ... />}
  columnWrapperStyle={{ gap: spacing.sm }}
  contentContainerStyle={styles.listContent}
  ListHeaderComponent={<Header />}
  ListEmptyComponent={isLoading ? <LoadingState /> : <EmptyState />}
  ListFooterComponent={<View style={{ height: spacing.xxl + spacing.xl }} />}
/>
```

### Cálculo de ancho de card

```ts
const CARD_WIDTH = (Dimensions.get("window").width - spacing.md * 2 - spacing.sm) / 2;
```

Padding horizontal del container: `spacing.md` cada lado. Gap entre columnas: `spacing.sm`.

---

## Estilos nuevos necesarios (`styles.ts`)

```
listContent       paddingHorizontal: spacing.md, paddingTop: 0
header            paddingBottom: spacing.md
cardWrapper       flex: 1 (para que FlatList maneje el ancho)
```

Los estilos de modales, FAB, y formularios se mantienen sin cambios.

---

## Lo que NO cambia

- `useMisPlantasScreen` hook — sin modificaciones
- FAB (estilos y comportamiento)
- Modal crear planta
- Modal editar planta
- `PlantDetailScreen`
- Routing (`_layout.tsx`, `[id].tsx`, `index.tsx`)
- `plants.store`, `PlantImagePicker`, `SavePlantSheet`

---

## Archivos

### Crear
| Archivo | Descripción |
|---|---|
| `mobile/src/features/mis-plantas/components/PlantGridCard/PlantGridCard.tsx` | Card visual para grid |
| `mobile/src/features/mis-plantas/components/PlantGridCard/styles.ts` | Estilos del card |
| `mobile/src/features/mis-plantas/components/PlantGridCard/index.ts` | Re-export |

### Modificar
| Archivo | Cambio |
|---|---|
| `mobile/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx` | Reemplazar ScrollView+cards por FlatList+PlantGridCard, eliminar stats y HighlightCard |
| `mobile/src/features/mis-plantas/screens/MisPlantasScreen/styles.ts` | Limpiar estilos de cards horizontales, agregar `listContent` y `cardWrapper` |

---

## Restricciones

- Sin nuevas dependencias (no `expo-linear-gradient`, no `FlashList`)
- Overlay semitransparente (`rgba(0,0,0,0.55)`) en lugar de gradiente real
- Compatible con dark y light theme via tokens del design system
- No modificar el backend API
- Mantener comportamiento funcional (crear, editar, FAB, navegación a detalle) idéntico
