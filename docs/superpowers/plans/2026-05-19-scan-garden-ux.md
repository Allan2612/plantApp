# Scan → Jardín UI/UX Mejora — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mejorar la experiencia completa desde que el usuario escanea una planta hasta que la ve en su jardín: flujo de guardado con confirmación, estado de éxito visual, pantalla de detalle de planta, cards rediseñadas y picker de imagen real (no URL manual).

**Architecture:** `IdentificarPhotoPreview` pasa a un state machine con 5 estados explícitos. Un nuevo `SavePlantSheet` intercepta el guardado para pedir nickname + ubicación. Un Zustand store (`plants.store`) comparte la lista de plantas entre `MisPlantasScreen` y `PlantDetailScreen`. La ruta `misplantas.tsx` se convierte en directorio para soportar `[id].tsx`.

**Tech Stack:** Expo Router, React Native Animated, expo-image-picker, Zustand v5, React Hook Form, Ionicons.

---

## Mapa de archivos

### Crear
| Archivo | Responsabilidad |
|---|---|
| `mobile/app/(tabs)/misplantas/_layout.tsx` | Stack navigator para tab misplantas |
| `mobile/app/(tabs)/misplantas/index.tsx` | Punto de entrada del tab (delega a MisPlantasScreen) |
| `mobile/app/(tabs)/misplantas/[id].tsx` | Ruta dinámica de detalle de planta |
| `mobile/src/store/plants.store.ts` | Zustand store — lista de plantas compartida |
| `mobile/src/components/shared/PlantImagePicker/PlantImagePicker.tsx` | Picker de imagen (cámara/galería) reusable |
| `mobile/src/components/shared/PlantImagePicker/styles.ts` | Estilos del picker |
| `mobile/src/components/shared/PlantImagePicker/index.ts` | Re-export |
| `mobile/src/features/identificar/components/SavePlantSheet/SavePlantSheet.tsx` | Bottom sheet de confirmación pre-guardado |
| `mobile/src/features/identificar/components/SavePlantSheet/styles.ts` | Estilos del sheet |
| `mobile/src/features/identificar/components/SavePlantSheet/index.ts` | Re-export |
| `mobile/src/features/mis-plantas/screens/PlantDetailScreen/PlantDetailScreen.tsx` | Pantalla de detalle de planta |
| `mobile/src/features/mis-plantas/screens/PlantDetailScreen/styles.ts` | Estilos del detalle |
| `mobile/src/features/mis-plantas/screens/PlantDetailScreen/index.ts` | Re-export |

### Eliminar
| Archivo |
|---|
| `mobile/app/(tabs)/misplantas.tsx` |

### Modificar
| Archivo | Cambio principal |
|---|---|
| `mobile/src/features/identificar/components/IdentificarEmptyState/IdentificarEmptyState.tsx` | Ilustración + copy + botón galería |
| `mobile/src/features/identificar/components/IdentificarPhotoPreview/IdentificarPhotoPreview.tsx` | State machine + SavePlantSheet + estado saved |
| `mobile/src/features/identificar/components/IdentificarPhotoPreview/styles.ts` | Estilos para estado saved |
| `mobile/src/features/identificar/hooks/useIdentificarScreen.ts` | handleSavePlant con data param + isSaved + navega |
| `mobile/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx` | Cards horizontales + FAB + highlight + PlantImagePicker |
| `mobile/src/features/mis-plantas/screens/MisPlantasScreen/styles.ts` | Estilos para cards y FAB |
| `mobile/src/features/mis-plantas/hooks/useMisPlantasScreen.ts` | favoriteCount + sync plants.store + validación URI content:// |

---

## Task 1: Reestructurar ruta misplantas para soportar [id]

**Files:**
- Delete: `mobile/app/(tabs)/misplantas.tsx`
- Create: `mobile/app/(tabs)/misplantas/_layout.tsx`
- Create: `mobile/app/(tabs)/misplantas/index.tsx`

- [ ] **Step 1: Crear el directorio y el _layout**

Crea el directorio `mobile/app/(tabs)/misplantas/` y el archivo `_layout.tsx`:

```tsx
// mobile/app/(tabs)/misplantas/_layout.tsx
import { Stack } from "expo-router";

export default function MisPlantasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
```

- [ ] **Step 2: Crear index.tsx**

```tsx
// mobile/app/(tabs)/misplantas/index.tsx
import MisPlantasScreen from "@/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen";

export default function MisPlantas() {
  return <MisPlantasScreen />;
}
```

- [ ] **Step 3: Eliminar misplantas.tsx**

Elimina el archivo `mobile/app/(tabs)/misplantas.tsx`. El archivo `index.tsx` lo reemplaza con el mismo contenido.

- [ ] **Step 4: Crear ruta placeholder [id].tsx**

```tsx
// mobile/app/(tabs)/misplantas/[id].tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { View } from "react-native";

export default function PlantDetailRoute() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <AppText variant="body">Detalle — próximamente</AppText>
    </View>
  );
}
```

- [ ] **Step 5: Verificar navegación**

Inicia el servidor de desarrollo:
```
cd mobile && npx expo start
```
Navega a "Mi jardín" en la app. La tab debe seguir funcionando igual. No deben aparecer errores de navegación.

- [ ] **Step 6: Commit**

```
git add app/(tabs)/misplantas/
git rm app/(tabs)/misplantas.tsx
git commit -m "feat: reestructura ruta misplantas a directorio para soportar [id]"
```

---

## Task 2: Zustand store para plantas compartidas

**Files:**
- Create: `mobile/src/store/plants.store.ts`

- [ ] **Step 1: Crear plants.store.ts**

```ts
// mobile/src/store/plants.store.ts
import { create } from "zustand";
import { UserPlantListItem } from "@/src/features/mis-plantas/services/misPlantasApi.service";

interface PlantsStore {
  plants: UserPlantListItem[];
  setPlants: (plants: UserPlantListItem[]) => void;
}

export const usePlantsStore = create<PlantsStore>((set) => ({
  plants: [],
  setPlants: (plants) => set({ plants }),
}));
```

- [ ] **Step 2: Commit**

```
git add src/store/plants.store.ts
git commit -m "feat: zustand store para lista de plantas compartida"
```

---

## Task 3: PlantImagePicker — componente compartido

Reemplaza el TextInput de URL de imagen en los formularios de mis-plantas.

**Files:**
- Create: `mobile/src/components/shared/PlantImagePicker/PlantImagePicker.tsx`
- Create: `mobile/src/components/shared/PlantImagePicker/styles.ts`
- Create: `mobile/src/components/shared/PlantImagePicker/index.ts`

- [ ] **Step 1: Crear styles.ts**

```ts
// mobile/src/components/shared/PlantImagePicker/styles.ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    emptyContainer: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.surfaceDivider,
      borderStyle: "dashed",
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    previewContainer: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: colors.surfaceAlt,
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    changeOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    changeText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
  });
}
```

- [ ] **Step 2: Crear PlantImagePicker.tsx**

```tsx
// mobile/src/components/shared/PlantImagePicker/PlantImagePicker.tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Alert, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface PlantImagePickerProps {
  value: string | null;
  onChange: (uri: string | null) => void;
}

async function launchCamera(): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    allowsEditing: true,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

async function launchGallery(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    allowsEditing: true,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export default function PlantImagePicker({ value, onChange }: PlantImagePickerProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handlePress = () => {
    const buttons: Parameters<typeof Alert.alert>[2] = [
      {
        text: "Tomar foto",
        onPress: async () => {
          const uri = await launchCamera();
          if (uri) onChange(uri);
        },
      },
      {
        text: "Elegir de galería",
        onPress: async () => {
          const uri = await launchGallery();
          if (uri) onChange(uri);
        },
      },
      ...(value
        ? [{ text: "Eliminar foto", style: "destructive" as const, onPress: () => onChange(null) }]
        : []),
      { text: "Cancelar", style: "cancel" as const },
    ];
    Alert.alert("Imagen de la planta", undefined, buttons);
  };

  if (value) {
    return (
      <TouchableOpacity style={styles.previewContainer} onPress={handlePress} activeOpacity={0.85}>
        <Image source={{ uri: value }} style={styles.previewImage} contentFit="cover" transition={120} />
        <View style={styles.changeOverlay}>
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          <AppText variant="caption" style={styles.changeText}>
            Cambiar foto
          </AppText>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.emptyContainer} onPress={handlePress} activeOpacity={0.85}>
      <Ionicons name="camera-outline" size={28} color={theme.colors.textSecondary} />
      <AppText variant="caption" color={theme.colors.textSecondary}>
        Agregar foto
      </AppText>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 3: Crear index.ts**

```ts
// mobile/src/components/shared/PlantImagePicker/index.ts
export { default } from "./PlantImagePicker";
```

- [ ] **Step 4: Verificar en dev**

El componente aún no está integrado pero debe compilar sin errores de TypeScript:
```
cd mobile && npx tsc --noEmit
```
Esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```
git add src/components/shared/PlantImagePicker/
git commit -m "feat: PlantImagePicker — picker de imagen con cámara/galería"
```

---

## Task 4: SavePlantSheet — bottom sheet de confirmación pre-guardado

**Files:**
- Create: `mobile/src/features/identificar/components/SavePlantSheet/SavePlantSheet.tsx`
- Create: `mobile/src/features/identificar/components/SavePlantSheet/styles.ts`
- Create: `mobile/src/features/identificar/components/SavePlantSheet/index.ts`

- [ ] **Step 1: Crear styles.ts**

```ts
// mobile/src/features/identificar/components/SavePlantSheet/styles.ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      width: "100%",
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    handleBar: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceDivider,
      marginBottom: spacing.xs,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    thumbnailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    thumbnail: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
    },
    plantNameBlock: {
      flex: 1,
      gap: 2,
    },
    scientificName: {
      fontStyle: "italic",
    },
    fieldBlock: {
      gap: spacing.xs,
    },
    input: {
      height: 44,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      color: "#000",
      paddingHorizontal: spacing.sm,
      fontSize: 15,
    },
    caption: {
      textAlign: "center",
    },
  });
}
```

- [ ] **Step 2: Crear SavePlantSheet.tsx**

```tsx
// mobile/src/features/identificar/components/SavePlantSheet/SavePlantSheet.tsx
import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { PlantIdentificationResult } from "@/src/features/identificar/services/aiIdentification.service";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { createStyles } from "./styles";

export interface SavePlantData {
  nickname: string;
  locationHome?: string;
}

interface SavePlantSheetProps {
  visible: boolean;
  aiResult: PlantIdentificationResult;
  capturedPhotoUri: string;
  isSaving: boolean;
  isOffline: boolean;
  onSave: (data: SavePlantData) => Promise<void>;
  onClose: () => void;
}

export default function SavePlantSheet({
  visible,
  aiResult,
  capturedPhotoUri,
  isSaving,
  isOffline,
  onSave,
  onClose,
}: SavePlantSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const locationRef = useRef<TextInput>(null);

  const [nickname, setNickname] = useState(aiResult.commonName ?? "");
  const [locationHome, setLocationHome] = useState("");

  useEffect(() => {
    if (visible) {
      setNickname(aiResult.commonName ?? "");
      setLocationHome("");
    }
  }, [visible, aiResult.commonName]);

  const handleSave = async () => {
    if (!nickname.trim()) return;
    await onSave({ nickname: nickname.trim(), locationHome: locationHome.trim() || undefined });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <Pressable onPress={onClose} style={{ flex: 1 }} />
          <View style={styles.sheet}>
            <View style={styles.handleBar} />

            <View style={styles.headerRow}>
              <AppText variant="subheading">Agregar a mi jardín</AppText>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.thumbnailRow}>
              <Image
                source={{ uri: capturedPhotoUri }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={120}
              />
              <View style={styles.plantNameBlock}>
                <AppText variant="label" numberOfLines={1}>
                  {aiResult.commonName}
                </AppText>
                {aiResult.scientificName ? (
                  <AppText
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.scientificName}
                    numberOfLines={1}
                  >
                    {aiResult.scientificName}
                  </AppText>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="label">Nombre en tu jardín</AppText>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Ej: Monstera grande"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                returnKeyType="next"
                onSubmitEditing={() => locationRef.current?.focus()}
                autoFocus
              />
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="label">
                Ubicación{" "}
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  (opcional)
                </AppText>
              </AppText>
              <TextInput
                ref={locationRef}
                value={locationHome}
                onChangeText={setLocationHome}
                placeholder="Sala, balcón, ventana sur..."
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            <AppButton
              title={
                isOffline
                  ? "Sin conexión"
                  : isSaving
                  ? "Guardando..."
                  : "Añadir al jardín"
              }
              onPress={handleSave}
              disabled={isSaving || isOffline || !nickname.trim()}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
```

- [ ] **Step 3: Crear index.ts**

```ts
// mobile/src/features/identificar/components/SavePlantSheet/index.ts
export { default } from "./SavePlantSheet";
export type { SavePlantData } from "./SavePlantSheet";
```

- [ ] **Step 4: Verificar TypeScript**

```
cd mobile && npx tsc --noEmit
```
Esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```
git add src/features/identificar/components/SavePlantSheet/
git commit -m "feat: SavePlantSheet — confirmación pre-guardado con nickname y ubicación"
```

---

## Task 5: PlantDetailScreen y ruta dinámica [id]

**Files:**
- Create: `mobile/src/features/mis-plantas/screens/PlantDetailScreen/PlantDetailScreen.tsx`
- Create: `mobile/src/features/mis-plantas/screens/PlantDetailScreen/styles.ts`
- Create: `mobile/src/features/mis-plantas/screens/PlantDetailScreen/index.ts`
- Modify: `mobile/app/(tabs)/misplantas/[id].tsx`

- [ ] **Step 1: Crear styles.ts**

```ts
// mobile/src/features/mis-plantas/screens/PlantDetailScreen/styles.ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    hero: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: colors.surfaceAlt,
    },
    heroFallback: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      padding: spacing.md,
      gap: spacing.lg,
    },
    titleBlock: {
      gap: spacing.xs,
    },
    scientificName: {
      fontStyle: "italic",
    },
    section: {
      gap: spacing.sm,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingBottom: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.surfaceDivider,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    infoText: {
      flex: 1,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    metaLabel: {
      width: 100,
    },
    toxicBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      alignSelf: "flex-start",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      borderWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
      position: "absolute",
      top: spacing.md,
      left: spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    notFoundContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
      padding: spacing.xl,
    },
  });
}
```

- [ ] **Step 2: Crear PlantDetailScreen.tsx**

```tsx
// mobile/src/features/mis-plantas/screens/PlantDetailScreen/PlantDetailScreen.tsx
import AppText from "@/src/components/shared/AppText/AppText";
import {
  getCatalogPlantName,
  getHealthStatus,
  getStringField,
  getUserPlantPayload,
  healthLabels,
  resolvePlantImage,
  formatDateDisplay,
} from "@/src/features/mis-plantas/hooks/useMisPlantasScreen";
import { usePlantsStore } from "@/src/store/plants.store";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

const HEALTH_COLOR: Record<string, string> = {
  good: "#22c55e",
  regular: "#f59e0b",
  bad: "#ef4444",
};

export default function PlantDetailScreen() {
  const theme = useAppTheme();
  const { colors, spacing } = theme;
  const styles = createStyles(theme);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plants = usePlantsStore((s) => s.plants);
  const item = plants.find((p) => {
    const payload = getUserPlantPayload(p);
    return getStringField(payload, "id") === id;
  });

  if (!item) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
        <AppText variant="body" color={colors.textSecondary}>
          Planta no encontrada.
        </AppText>
        <TouchableOpacity onPress={() => router.back()}>
          <AppText variant="caption" color={colors.primary}>
            Volver al jardín
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const payload = getUserPlantPayload(item);
  const health = getHealthStatus(payload);
  const plantImage = resolvePlantImage(item);
  const catalogName = getCatalogPlantName(item);
  const nickname = getStringField(payload, "nickname") || "Sin nombre";
  const locationHome = getStringField(payload, "locationHome");
  const acquiredDate = getStringField(payload, "acquiredDate");
  const notes = getStringField(payload, "notes");

  const catalog = item.catalogPlant as Record<string, unknown> | null;
  const scientificName = catalog ? (catalog.scientificName as string | undefined) : undefined;
  const lightNotes = catalog ? (catalog.lightNotes as string | undefined) : undefined;
  const generalCareNotes = catalog ? (catalog.generalCareNotes as string | undefined) : undefined;
  const difficulty = catalog ? (catalog.difficulty as string | undefined) : undefined;
  const isToxic = catalog ? (catalog.isToxic as boolean | null) : null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          {plantImage ? (
            <Image source={{ uri: plantImage }} style={styles.hero} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons name="leaf-outline" size={64} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Título */}
          <View style={styles.titleBlock}>
            <AppText variant="heading">{nickname}</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {catalogName}
            </AppText>
            {scientificName ? (
              <AppText variant="caption" color={colors.textMuted} style={styles.scientificName}>
                {scientificName}
              </AppText>
            ) : null}
          </View>

          {/* Estado de salud */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
              <AppText variant="label" color={colors.textSecondary}>
                Estado de salud
              </AppText>
            </View>
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.toxicBadge,
                  {
                    borderColor: HEALTH_COLOR[health] ?? colors.primary,
                    backgroundColor: (HEALTH_COLOR[health] ?? colors.primary) + "20",
                  },
                ]}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: HEALTH_COLOR[health] ?? colors.primary,
                  }}
                />
                <AppText
                  variant="caption"
                  style={{ color: HEALTH_COLOR[health] ?? colors.primary, fontWeight: "600" }}
                >
                  {healthLabels[health]}
                </AppText>
              </View>
            </View>
          </View>

          {/* Cuidados del catálogo */}
          {(lightNotes || generalCareNotes || difficulty || isToxic !== null) ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="leaf-outline" size={16} color={colors.textSecondary} />
                <AppText variant="label" color={colors.textSecondary}>
                  Cuidados
                </AppText>
              </View>
              {lightNotes ? (
                <View style={styles.infoRow}>
                  <Ionicons name="sunny-outline" size={14} color={colors.textSecondary} />
                  <AppText variant="caption" color={colors.textSecondary} style={styles.infoText}>
                    {lightNotes}
                  </AppText>
                </View>
              ) : null}
              {generalCareNotes ? (
                <View style={styles.infoRow}>
                  <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
                  <AppText variant="caption" color={colors.textSecondary} style={styles.infoText}>
                    {generalCareNotes}
                  </AppText>
                </View>
              ) : null}
              {difficulty ? (
                <View style={styles.infoRow}>
                  <Ionicons name="bar-chart-outline" size={14} color={colors.textSecondary} />
                  <AppText variant="caption" color={colors.textSecondary} style={styles.infoText}>
                    Dificultad: {DIFFICULTY_LABEL[difficulty] ?? difficulty}
                  </AppText>
                </View>
              ) : null}
              {isToxic !== null ? (
                <View style={styles.infoRow}>
                  <Ionicons
                    name={isToxic ? "warning-outline" : "checkmark-circle-outline"}
                    size={14}
                    color={isToxic ? colors.danger : colors.primary}
                  />
                  <AppText
                    variant="caption"
                    color={isToxic ? colors.danger : colors.primary}
                    style={styles.infoText}
                  >
                    {isToxic ? "Tóxica para mascotas/personas" : "No tóxica"}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Mi planta */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <AppText variant="label" color={colors.textSecondary}>
                Mi planta
              </AppText>
            </View>
            {locationHome ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.infoText}>
                  {locationHome}
                </AppText>
              </View>
            ) : null}
            {acquiredDate ? (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.infoText}>
                  Adquirida: {formatDateDisplay(acquiredDate)}
                </AppText>
              </View>
            ) : null}
            {notes ? (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.infoText}>
                  {notes}
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={{ height: spacing.xl }} />
        </View>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 3: Crear index.ts**

```ts
// mobile/src/features/mis-plantas/screens/PlantDetailScreen/index.ts
export { default } from "./PlantDetailScreen";
```

- [ ] **Step 4: Conectar ruta [id].tsx con PlantDetailScreen**

```tsx
// mobile/app/(tabs)/misplantas/[id].tsx
import PlantDetailScreen from "@/src/features/mis-plantas/screens/PlantDetailScreen/PlantDetailScreen";

export default function PlantDetailRoute() {
  return <PlantDetailScreen />;
}
```

- [ ] **Step 5: Verificar TypeScript**

```
cd mobile && npx tsc --noEmit
```
Esperado: sin errores nuevos. Si hay errores sobre `formatDateDisplay` no exportado, confirmar que está en el `export` de `useMisPlantasScreen.ts` (ya lo está: línea `export function formatDateDisplay`).

- [ ] **Step 6: Commit**

```
git add src/features/mis-plantas/screens/PlantDetailScreen/ app/(tabs)/misplantas/[id].tsx
git commit -m "feat: PlantDetailScreen y ruta dinámica [id] para detalle de planta"
```

---

## Task 6: Mejorar IdentificarEmptyState

**Files:**
- Modify: `mobile/src/features/identificar/components/IdentificarEmptyState/IdentificarEmptyState.tsx`

- [ ] **Step 1: Reemplazar IdentificarEmptyState.tsx**

```tsx
// mobile/src/features/identificar/components/IdentificarEmptyState/IdentificarEmptyState.tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface IdentificarEmptyStateProps {
  onOpenCamera: () => void;
  onPickFromGallery: () => void;
}

export default function IdentificarEmptyState({ onOpenCamera, onPickFromGallery }: IdentificarEmptyStateProps) {
  const theme = useAppTheme();
  const { colors, spacing } = theme;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Ilustración */}
      <View style={styles.iconStack}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={48} color={colors.primary} />
        </View>
        <View style={styles.cameraChip}>
          <Ionicons name="camera" size={18} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <AppText variant="heading" style={styles.centerText}>
          Identifica tu planta
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
          Usa IA para reconocer cualquier planta y agregarla a tu jardín automáticamente.
        </AppText>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onOpenCamera} activeOpacity={0.85}>
        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        <AppText variant="label" style={styles.primaryButtonText}>
          Tomar foto
        </AppText>
      </TouchableOpacity>

      <Pressable onPress={onPickFromGallery} style={styles.secondaryLink}>
        <AppText variant="caption" color={colors.primary}>
          Elegir de galería
        </AppText>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 2: Actualizar styles.ts**

```ts
// mobile/src/features/identificar/components/IdentificarEmptyState/styles.ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.lg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    iconStack: {
      position: "relative",
      width: 100,
      height: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary + "40",
    },
    cameraChip: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    textBlock: {
      gap: spacing.sm,
      alignItems: "center",
    },
    centerText: {
      textAlign: "center",
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      height: 52,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignSelf: "stretch",
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    secondaryLink: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
  });
}
```

- [ ] **Step 3: Verificar en dev**

Navega a la tab "Identificar" en la app. Debe mostrar el ícono de hoja con chip de cámara, título "Identifica tu planta", botón primario "Tomar foto" y link "Elegir de galería".

- [ ] **Step 4: Commit**

```
git add src/features/identificar/components/IdentificarEmptyState/
git commit -m "feat: mejora IdentificarEmptyState — ilustración, copy y acceso a galería"
```

---

## Task 7: Refactorizar IdentificarPhotoPreview con state machine

**Files:**
- Modify: `mobile/src/features/identificar/components/IdentificarPhotoPreview/IdentificarPhotoPreview.tsx`
- Modify: `mobile/src/features/identificar/components/IdentificarPhotoPreview/styles.ts`

El componente pasa de un árbol de condicionales a 5 estados mutuamente excluyentes:
`idle | analyzing | result-plant | result-no-plant | saved`

- [ ] **Step 1: Actualizar styles.ts con estilos del estado saved**

Agrega al final de `createStyles` en el archivo existente (conserva todos los estilos actuales, solo agrega los nuevos):

```ts
// Agregar al StyleSheet.create() en styles.ts:

// Saved state
savedContainer: {
  gap: spacing.lg,
  alignItems: "center",
  paddingVertical: spacing.xl,
},
savedIconCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.primary + "20",
  alignItems: "center",
  justifyContent: "center",
},
savedTitle: {
  textAlign: "center",
},
savedSubtitle: {
  textAlign: "center",
  lineHeight: 22,
},
savedActions: {
  width: "100%",
  gap: spacing.sm,
},
viewGardenButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
  height: 50,
  borderRadius: radius.full,
  backgroundColor: colors.primary,
},
viewGardenButtonText: {
  color: "#FFFFFF",
  fontWeight: "700",
},
newScanLink: {
  alignItems: "center",
  paddingVertical: spacing.sm,
},
```

- [ ] **Step 2: Reemplazar IdentificarPhotoPreview.tsx**

```tsx
// mobile/src/features/identificar/components/IdentificarPhotoPreview/IdentificarPhotoPreview.tsx
import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import SavePlantSheet from "@/src/features/identificar/components/SavePlantSheet";
import { SavePlantData } from "@/src/features/identificar/components/SavePlantSheet/SavePlantSheet";
import { PlantIdentificationResult } from "@/src/features/identificar/services/aiIdentification.service";
import { DetectionResult } from "@/src/features/identificar/services/localObjectDetection.service";
import { PhotoResult } from "@/src/services/cameraService";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface IdentificarPhotoPreviewProps {
  photo: PhotoResult;
  detections: DetectionResult[];
  isDetecting: boolean;
  isIdentifying: boolean;
  isSaving: boolean;
  isOffline: boolean;
  isSaved: boolean;
  savedPlantName: string | null;
  aiResult: PlantIdentificationResult | null;
  aiImageUrl: string | null;
  description: string;
  onChangeDescription: (value: string) => void;
  onRetake: () => void;
  onClear: () => void;
  onIdentify: () => void;
  onSavePlant: (data: SavePlantData) => Promise<void>;
  onGoToGarden: () => void;
  onNewScan: () => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

type ViewState = "idle" | "analyzing" | "result-plant" | "result-no-plant" | "saved";

function resolveState(
  isIdentifying: boolean,
  isDetecting: boolean,
  aiResult: PlantIdentificationResult | null,
  isSaved: boolean,
): ViewState {
  if (isSaved) return "saved";
  if (isIdentifying || isDetecting) return "analyzing";
  if (!aiResult) return "idle";
  return aiResult.isPlant ? "result-plant" : "result-no-plant";
}

export default function IdentificarPhotoPreview({
  photo,
  detections,
  isDetecting,
  isIdentifying,
  isSaving,
  isOffline,
  isSaved,
  savedPlantName,
  aiResult,
  aiImageUrl,
  description,
  onChangeDescription,
  onRetake,
  onClear,
  onIdentify,
  onSavePlant,
  onGoToGarden,
  onNewScan,
}: IdentificarPhotoPreviewProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [refImageError, setRefImageError] = useState(false);

  const viewState = resolveState(isIdentifying, isDetecting, aiResult, isSaved);
  const confidencePct = aiResult ? Math.round(aiResult.confidence * 100) : 0;
  const showRefImage = Boolean(aiImageUrl && !refImageError);

  // Estado saved
  if (viewState === "saved") {
    return (
      <View style={styles.container}>
        <View style={styles.savedContainer}>
          <View style={styles.savedIconCircle}>
            <Ionicons name="checkmark" size={40} color={colors.primary} />
          </View>
          <AppText variant="heading" style={styles.savedTitle}>
            ¡Planta agregada!
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.savedSubtitle}>
            {savedPlantName ?? "Tu planta"} fue guardada en tu jardín.
          </AppText>
          <View style={styles.savedActions}>
            <TouchableOpacity style={styles.viewGardenButton} onPress={onGoToGarden} activeOpacity={0.85}>
              <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
              <AppText variant="label" style={styles.viewGardenButtonText}>
                Ver en mi jardín
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.newScanLink} onPress={onNewScan} activeOpacity={0.7}>
              <AppText variant="caption" color={colors.primary}>
                Identificar otra planta
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con badge de estado */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
          <AppText variant="caption" style={styles.badgeText}>
            {viewState === "analyzing"
              ? isIdentifying
                ? "Identificando con IA..."
                : "Pre-analizando imagen..."
              : viewState === "result-plant" || viewState === "result-no-plant"
              ? "Análisis completado"
              : "Lista para analizar"}
          </AppText>
        </View>
        <AppText variant="heading">
          {viewState === "analyzing" ? "Analizando..." : "Confirma tu foto"}
        </AppText>
        {viewState === "idle" ? (
          <AppText variant="body" color={colors.textSecondary} style={styles.headerSubtitle}>
            Revisa la imagen y agrega contexto para mejores resultados.
          </AppText>
        ) : null}
      </View>

      {/* Imagen */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.uri }} style={styles.image} />
        {viewState === "analyzing" ? (
          <View style={styles.imageOverlay}>
            <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
            <AppText variant="caption" style={styles.imageOverlayText}>
              {isIdentifying ? "Identificando..." : "Procesando..."}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* Botones retomar/eliminar — solo en idle y result */}
      {viewState !== "analyzing" ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onRetake} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={16} color={colors.textPrimary} />
            <AppText variant="caption" style={styles.actionButtonText}>
              Tomar otra
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onClear} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <AppText variant="caption" style={[styles.actionButtonText, { color: colors.danger }]}>
              Eliminar
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* IDLE: input descripción + botón analizar */}
      {viewState === "idle" ? (
        <>
          <View style={styles.inputBlock}>
            <AppText variant="label">Contexto adicional</AppText>
            <AppText variant="caption" color={colors.textSecondary} style={styles.inputHelperText}>
              Describe lo que ves: color de hojas, manchas, condiciones de luz...
            </AppText>
            <import TextInput = require("react-native").TextInput />
            {/* TextInput — ver nota abajo */}
          </View>
          <View style={styles.identifyBlock}>
            <AppButton
              title={isOffline ? "Sin conexión" : "Analizar con IA"}
              onPress={onIdentify}
              disabled={isOffline}
            />
            <AppText variant="caption" color={colors.textSecondary} style={styles.identifyCaption}>
              {isOffline ? "Conéctate a internet para identificar la planta" : "El análisis puede tardar unos segundos"}
            </AppText>
          </View>
          {detections.length > 0 ? (
            <View style={styles.detectionsContainer}>
              <View style={styles.detectionsHeader}>
                <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                <AppText variant="label" color={colors.textSecondary}>
                  Pre-análisis local
                </AppText>
              </View>
              {detections.map((item, index) => (
                <View key={`${item.label}-${index}`} style={styles.detectionRow}>
                  <AppText variant="caption" color={colors.textSecondary} style={styles.detectionLabel}>
                    {item.label}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {Math.round(item.score * 100)}%
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {/* RESULT-PLANT: card de resultado */}
      {viewState === "result-plant" && aiResult ? (
        <View style={styles.aiResultCard}>
          <View style={styles.aiResultHeader}>
            <Ionicons name="leaf" size={18} color={colors.primary} />
            <View style={styles.aiResultTitleBlock}>
              <AppText variant="subheading" style={styles.aiResultName}>
                {aiResult.commonName}
              </AppText>
              {aiResult.scientificName ? (
                <AppText variant="caption" color={colors.textSecondary} style={styles.aiResultScientific}>
                  {aiResult.scientificName}
                </AppText>
              ) : null}
            </View>
          </View>

          {showRefImage ? (
            <Image
              source={{ uri: aiImageUrl! }}
              style={{ width: "100%", height: 160, borderRadius: 10, marginVertical: 8 }}
              resizeMode="cover"
              onError={() => setRefImageError(true)}
            />
          ) : null}

          <View style={styles.confidenceRow}>
            <AppText variant="caption" color={colors.textSecondary}>Confianza</AppText>
            <View style={styles.confidenceBarBg}>
              <View style={[styles.confidenceBarFill, { width: `${confidencePct}%` as `${number}%` }]} />
            </View>
            <AppText variant="caption" color={colors.primary} style={styles.confidencePct}>
              {confidencePct}%
            </AppText>
          </View>

          <View style={styles.aiDivider} />

          {aiResult.wateringNotes ? (
            <View style={styles.aiInfoRow}>
              <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary} style={styles.aiInfoText}>
                {aiResult.wateringNotes}
              </AppText>
            </View>
          ) : null}
          {aiResult.lightNotes ? (
            <View style={styles.aiInfoRow}>
              <Ionicons name="sunny-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary} style={styles.aiInfoText}>
                {aiResult.lightNotes}
              </AppText>
            </View>
          ) : null}
          {aiResult.difficulty ? (
            <View style={styles.aiInfoRow}>
              <Ionicons name="bar-chart-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary} style={styles.aiInfoText}>
                Dificultad: {DIFFICULTY_LABEL[aiResult.difficulty] ?? aiResult.difficulty}
              </AppText>
            </View>
          ) : null}
          {aiResult.isToxic !== null ? (
            <View style={styles.aiInfoRow}>
              <Ionicons
                name={aiResult.isToxic ? "warning-outline" : "checkmark-circle-outline"}
                size={14}
                color={aiResult.isToxic ? colors.danger : colors.primary}
              />
              <AppText
                variant="caption"
                color={aiResult.isToxic ? colors.danger : colors.primary}
                style={styles.aiInfoText}
              >
                {aiResult.isToxic ? "Tóxica para mascotas/personas" : "No tóxica"}
              </AppText>
            </View>
          ) : null}

          <View style={styles.aiDivider} />

          <AppButton
            title={isOffline ? "Sin conexión" : "Guardar en Mi Jardín"}
            onPress={() => setShowSaveSheet(true)}
            disabled={isOffline}
          />
        </View>
      ) : null}

      {/* RESULT-NO-PLANT */}
      {viewState === "result-no-plant" ? (
        <View style={styles.noPlantCard}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
          <AppText variant="label" color={colors.danger}>
            No se detectó una planta
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.noPlantText}>
            Intenta con una foto más clara, mejor iluminada y con la planta como tema principal.
          </AppText>
        </View>
      ) : null}

      {/* SavePlantSheet */}
      {aiResult?.isPlant && showSaveSheet ? (
        <SavePlantSheet
          visible={showSaveSheet}
          aiResult={aiResult}
          capturedPhotoUri={photo.uri}
          isSaving={isSaving}
          isOffline={isOffline}
          onSave={async (data) => {
            await onSavePlant(data);
            setShowSaveSheet(false);
          }}
          onClose={() => setShowSaveSheet(false)}
        />
      ) : null}
    </View>
  );
}
```

**Nota importante:** El bloque `idle` contiene un placeholder de `TextInput` con un comentario inválido. Reemplazar el bloque `inputBlock` completo con:

```tsx
<View style={styles.inputBlock}>
  <AppText variant="label">Contexto adicional</AppText>
  <AppText variant="caption" color={colors.textSecondary} style={styles.inputHelperText}>
    Describe lo que ves: color de hojas, manchas, condiciones de luz...
  </AppText>
  <TextInput
    value={description}
    onChangeText={onChangeDescription}
    placeholder="Ej: hojas amarillas con manchas cafes, poca luz..."
    placeholderTextColor={colors.textSecondary}
    multiline
    textAlignVertical="top"
    style={styles.descriptionInput}
  />
</View>
```

El import de `TextInput` va junto con los otros imports de `react-native`:
```ts
import { Image, TextInput, TouchableOpacity, View } from "react-native";
```

- [ ] **Step 3: Verificar TypeScript**

```
cd mobile && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```
git add src/features/identificar/components/IdentificarPhotoPreview/
git commit -m "feat: IdentificarPhotoPreview state machine — idle/analyzing/result/saved"
```

---

## Task 8: Actualizar useIdentificarScreen para SavePlantSheet y navegación post-guardado

**Files:**
- Modify: `mobile/src/features/identificar/hooks/useIdentificarScreen.ts`

- [ ] **Step 1: Reemplazar el hook completo**

```ts
// mobile/src/features/identificar/hooks/useIdentificarScreen.ts
import { useAuthStore } from "@/src/store/auth.store";
import { createCatalogPlant } from "@/src/features/catalogo/services/catalogoApi.service";
import { createUserPlant } from "@/src/features/mis-plantas/services/misPlantasApi.service";
import {
  fetchPlantImageUrl,
  identifyPlantFromUri,
  PlantIdentificationResult,
} from "@/src/features/identificar/services/aiIdentification.service";
import { SavePlantData } from "@/src/features/identificar/components/SavePlantSheet/SavePlantSheet";
import { useCamera } from "@/src/features/identificar/hooks/useCamera";
import LocalObjectDetectionService, {
  DetectionResult,
} from "@/src/features/identificar/services/localObjectDetection.service";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { useToast } from "@/src/providers/ToastProvider";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export type PermissionStep = "camera" | "mediaLibrary" | "granted";

export function useIdentificarScreen() {
  const camera = useCamera({ requestOnMount: true });
  const { showToast } = useToast();
  const { isConnected } = useNetworkStatus();
  const profile = useAuthStore((state) => state.profile);
  const router = useRouter();
  const isOffline = isConnected === false;

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiResult, setAiResult] = useState<PlantIdentificationResult | null>(null);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPlantName, setSavedPlantName] = useState<string | null>(null);
  const [savedPlantId, setSavedPlantId] = useState<string | null>(null);
  const [pickedPhoto, setPickedPhoto] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [galleryThumbnailUri, setGalleryThumbnailUri] = useState<string | null>(null);

  const capturedPhoto = camera.lastPhoto ?? pickedPhoto;

  useEffect(() => {
    MediaLibrary.getAssetsAsync({ first: 1, mediaType: "photo", sortBy: [["creationTime", false]] })
      .then((result) => setGalleryThumbnailUri(result.assets[0]?.uri ?? null))
      .catch(() => setGalleryThumbnailUri(null));
  }, []);

  const permissionStep: PermissionStep = !camera.isCameraPermissionGranted
    ? "camera"
    : !camera.isMediaLibraryPermissionGranted
    ? "mediaLibrary"
    : "granted";

  const openCamera = useCallback(() => {
    camera.clearError();
    setIsCameraOpen(true);
  }, [camera]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const runLocalDetection = useCallback(async (photoUri: string) => {
    setIsDetecting(true);
    setDetections([]);
    try {
      const results = await LocalObjectDetectionService.detectFromImageUri(photoUri);
      setDetections(results);
    } catch {
      setDetections([]);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const photo = await camera.takePhoto({ quality: 0.85 });
    if (!photo) return;
    setIsCameraOpen(false);
    setAiResult(null);
    setIsSaved(false);
    setSavedPlantName(null);
    setSavedPlantId(null);
    await runLocalDetection(photo.uri);
  }, [camera, runLocalDetection]);

  const handlePickFromGallery = useCallback(async () => {
    setIsCameraOpen(false);
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    camera.clearLastPhoto();
    setPickedPhoto({ uri: asset.uri, width: asset.width, height: asset.height });
    setAiResult(null);
    setAiImageUrl(null);
    setDetections([]);
    setIsSaved(false);
    setSavedPlantName(null);
    setSavedPlantId(null);
    await runLocalDetection(asset.uri);
  }, [camera, runLocalDetection]);

  const handleRetakePhoto = useCallback(() => {
    camera.clearLastPhoto();
    setPickedPhoto(null);
    setDetections([]);
    setDescription("");
    setAiResult(null);
    setAiImageUrl(null);
    setIsSaved(false);
    setSavedPlantName(null);
    setSavedPlantId(null);
    setIsCameraOpen(true);
  }, [camera]);

  const handleClearPhoto = useCallback(() => {
    camera.clearLastPhoto();
    setPickedPhoto(null);
    setDetections([]);
    setDescription("");
    setAiResult(null);
    setAiImageUrl(null);
    setIsSaved(false);
    setSavedPlantName(null);
    setSavedPlantId(null);
  }, [camera]);

  const handleIdentify = useCallback(async () => {
    if (!capturedPhoto || isIdentifying || isDetecting) return;
    setIsIdentifying(true);
    setAiResult(null);
    setAiImageUrl(null);
    try {
      const result = await identifyPlantFromUri(capturedPhoto.uri, description);
      setAiResult(result);
      if (result.isPlant) {
        fetchPlantImageUrl(result.scientificName, result.commonName).then(setAiImageUrl);
      } else {
        showToast("No se detectó una planta en la imagen. Intenta con una foto más clara.", "error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al analizar la imagen";
      showToast(message, "error");
    } finally {
      setIsIdentifying(false);
    }
  }, [capturedPhoto, description, isDetecting, isIdentifying, showToast]);

  const handleSavePlant = useCallback(
    async (data: SavePlantData) => {
      if (!aiResult?.isPlant || !aiResult.commonName || isSaving) return;
      const backendUserId = profile?.user.id;
      if (!backendUserId) {
        showToast("Debes iniciar sesión para guardar plantas.", "error");
        return;
      }
      setIsSaving(true);
      try {
        const catalogPlant = await createCatalogPlant({
          name: aiResult.commonName,
          scientificName: aiResult.scientificName ?? aiResult.commonName,
          description: aiResult.description ?? "",
          difficulty: aiResult.difficulty ?? "medium",
          isToxic: aiResult.isToxic ?? false,
          lightNotes: aiResult.lightNotes ?? undefined,
          generalCareNotes: aiResult.careSummary ?? undefined,
          imageUrl: aiImageUrl ?? undefined,
        });

        const savedPlant = await createUserPlant({
          userId: backendUserId,
          plantCatalogId: catalogPlant.id,
          nickname: data.nickname,
          locationHome: data.locationHome,
          notes: aiResult.careSummary ?? undefined,
        });

        const newId =
          typeof savedPlant === "object" && savedPlant !== null && "id" in savedPlant
            ? String((savedPlant as Record<string, unknown>).id)
            : null;

        setSavedPlantName(data.nickname);
        setSavedPlantId(newId);
        setIsSaved(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al guardar la planta";
        showToast(message, "error");
      } finally {
        setIsSaving(false);
      }
    },
    [aiImageUrl, aiResult, profile?.user.id, isSaving, showToast],
  );

  const handleGoToGarden = useCallback(() => {
    if (savedPlantId) {
      router.push(`/(tabs)/misplantas?highlight=${savedPlantId}` as never);
    } else {
      router.push("/(tabs)/misplantas" as never);
    }
    handleClearPhoto();
  }, [router, savedPlantId, handleClearPhoto]);

  const handleNewScan = useCallback(() => {
    handleClearPhoto();
  }, [handleClearPhoto]);

  return {
    cameraRef: camera.cameraRef,
    facing: camera.facing,
    flashMode: camera.flashMode,
    isBusy: camera.isBusy,
    isLoadingPermissions: camera.isLoadingPermissions,
    cameraError: camera.error,

    permissionStep,
    isCameraPermissionGranted: camera.isCameraPermissionGranted,
    isMediaLibraryPermissionGranted: camera.isMediaLibraryPermissionGranted,
    canAskAgainCamera: camera.canAskAgainCamera,
    canAskAgainMediaLibrary: camera.canAskAgainMediaLibrary,
    requestCameraPermission: camera.requestPermissions,
    requestMediaLibraryPermission: camera.requestMediaLibraryPermission,
    openSettings: camera.openSettings,

    toggleFacing: camera.toggleFacing,
    toggleFlash: camera.toggleFlash,

    isCameraOpen,
    openCamera,
    closeCamera,

    capturedPhoto,
    galleryThumbnailUri,
    handleTakePhoto,
    handlePickFromGallery,
    handleRetakePhoto,
    handleClearPhoto,
    handleIdentify,
    handleSavePlant,
    handleGoToGarden,
    handleNewScan,

    detections,
    isDetecting,
    aiResult,
    aiImageUrl,
    isIdentifying,
    isSaving,
    isSaved,
    savedPlantName,

    description,
    setDescription,
    isOffline,
  };
}
```

- [ ] **Step 2: Actualizar IdentificarScreen.tsx para pasar las nuevas props**

Abre `mobile/src/features/identificar/screens/IdentificarScreen/IdentificarScreen.tsx` y actualiza la parte que usa `IdentificarPhotoPreview`:

```tsx
// Añadir al destructuring del hook:
const {
  // ... existentes ...
  isSaved,
  savedPlantName,
  handleGoToGarden,
  handleNewScan,
  // ... resto ...
} = useIdentificarScreen();

// En el JSX, reemplazar <IdentificarPhotoPreview ... />:
<IdentificarPhotoPreview
  photo={capturedPhoto}
  detections={detections}
  isDetecting={isDetecting}
  isIdentifying={isIdentifying}
  isSaving={isSaving}
  isOffline={isOffline}
  isSaved={isSaved}
  savedPlantName={savedPlantName}
  aiResult={aiResult}
  aiImageUrl={aiImageUrl}
  description={description}
  onChangeDescription={setDescription}
  onRetake={handleRetakePhoto}
  onClear={handleClearPhoto}
  onIdentify={handleIdentify}
  onSavePlant={handleSavePlant}
  onGoToGarden={handleGoToGarden}
  onNewScan={handleNewScan}
/>
```

- [ ] **Step 3: Verificar TypeScript**

```
cd mobile && npx tsc --noEmit
```

- [ ] **Step 4: Probar flujo completo en dev**

1. Abre la tab Identificar → debe mostrar el EmptyState mejorado
2. Toma o selecciona una foto
3. Toca "Analizar con IA" → debe mostrar overlay de análisis
4. Tras el resultado, toca "Guardar en Mi Jardín" → debe abrirse el SavePlantSheet con el nombre pre-llenado
5. Edita nickname/ubicación → toca "Añadir al jardín"
6. Debe aparecer el estado `saved` con el nombre de la planta y botón "Ver en mi jardín"

- [ ] **Step 5: Commit**

```
git add src/features/identificar/hooks/useIdentificarScreen.ts src/features/identificar/screens/
git commit -m "feat: useIdentificarScreen — SavePlantSheet integration, isSaved state, navegación post-guardado"
```

---

## Task 9: Rediseñar MisPlantasScreen — cards horizontales, FAB, highlight, PlantImagePicker

**Files:**
- Modify: `mobile/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx`
- Modify: `mobile/src/features/mis-plantas/screens/MisPlantasScreen/styles.ts`
- Modify: `mobile/src/features/mis-plantas/hooks/useMisPlantasScreen.ts`

### 9a — useMisPlantasScreen: sync plants.store + favoriteCount + content:// URI

- [ ] **Step 1: Añadir imports al hook**

Al inicio de `useMisPlantasScreen.ts`, añadir:
```ts
import { usePlantsStore } from "@/src/store/plants.store";
```

- [ ] **Step 2: Actualizar imagePathSchema para aceptar content:// (Android)**

Reemplazar:
```ts
const imagePathSchema = z
  .string()
  .trim()
  .min(1, "Agrega una imagen de tu planta.")
  .refine(
    (value) => /^(https?:\/\/|file:\/\/|data:image\/)/i.test(value),
    "Usa una URL válida (https://...) o una ruta file://.",
  );
```
Con:
```ts
const imagePathSchema = z
  .string()
  .trim()
  .min(1, "Agrega una imagen de tu planta.")
  .refine(
    (value) => /^(https?:\/\/|file:\/\/|content:\/\/|data:image\/)/i.test(value),
    "Selecciona una imagen de la galería o toma una foto.",
  );
```

También actualizar el `.refine` en `editPlantSchema.customImageUrl`:
```ts
customImageUrl: z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^(https?:\/\/|file:\/\/|content:\/\/|data:image\/)/i.test(value),
    "Selecciona una imagen de la galería o toma una foto.",
  ),
```

- [ ] **Step 3: Sincronizar plants.store cuando se cargan plantas**

En `useMisPlantasScreen`, dentro de la función `loadAll` (o donde se llame `setPlants` después de `fetchUserPlants`), añadir la sincronización con el store. Busca el código que hace `setPlants(data.items)` y agrega después:

```ts
usePlantsStore.getState().setPlants(data.items);
```

Si `loadAll` está definida como una función interna, agrégalo justo después de la línea donde se llama `setPlants`.

- [ ] **Step 4: Añadir favoriteCount al return del hook**

Busca donde está definido `healthyCount` y agrega debajo:

```ts
const favoriteCount = plants.filter((item) => {
  const payload = getUserPlantPayload(item);
  return payload.favorite === true;
}).length;
```

Agrega `favoriteCount` al objeto de return del hook.

- [ ] **Step 5: Verificar TypeScript**

```
cd mobile && npx tsc --noEmit
```

### 9b — Rediseñar MisPlantasScreen

- [ ] **Step 6: Reemplazar styles.ts**

```ts
// mobile/src/features/mis-plantas/screens/MisPlantasScreen/styles.ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing.xxl + spacing.xl,
    },
    headerRow: {
      width: "100%",
      gap: spacing.xs,
    },
    errorCard: {
      width: "100%",
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
    },
    errorCardText: {
      color: colors.danger,
    },
    summaryRow: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.xs,
    },
    summaryCard: {
      flex: 1,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      gap: spacing.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryLabel: {
      color: colors.textMuted,
      textAlign: "center",
    },
    summaryValue: {
      textAlign: "center",
    },
    gallerySection: {
      gap: spacing.sm,
    },
    listHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    refreshText: {
      color: colors.primary,
    },
    plantList: {
      gap: spacing.sm,
    },
    // Card horizontal
    plantCard: {
      flexDirection: "row",
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      overflow: "hidden",
    },
    plantCardHighlight: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    cardImage: {
      width: 90,
      height: 90,
    },
    cardImageFallback: {
      width: 90,
      height: 90,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: {
      flex: 1,
      padding: spacing.sm,
      gap: spacing.xs,
      justifyContent: "center",
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    healthDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    locationChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    cardActions: {
      flexDirection: "row",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    cardActionBtn: {
      flex: 1,
      height: 30,
      borderRadius: radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      alignItems: "center",
      justifyContent: "center",
    },
    // FAB
    fab: {
      position: "absolute",
      bottom: spacing.xl,
      right: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    // Modal
    fieldBlock: {
      width: "100%",
      gap: spacing.xs,
    },
    fieldLabel: {
      color: colors.textPrimary,
    },
    editHeaderRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    closeEditText: {
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.cardOverlay,
      justifyContent: "flex-end",
    },
    modalCard: {
      width: "100%",
      maxHeight: "88%",
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    modalScroll: { width: "100%" },
    modalContent: { gap: spacing.md, paddingBottom: spacing.md },
    errorText: { color: colors.danger },
    dateSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 44,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
    },
    dateSelectorText: { flex: 1 },
    clearDateAction: { alignSelf: "flex-start", paddingTop: spacing.xs },
    clearDateText: { color: colors.danger },
    favoriteToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    favoriteToggleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    favoriteText: { color: colors.textSecondary },
    previewWrap: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    previewImage: { width: "100%", height: "100%" },
  });
}
```

- [ ] **Step 7: Reemplazar MisPlantasScreen.tsx**

Este archivo es extenso. Reemplázalo completamente:

```tsx
// mobile/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx
import AppButton from "@/src/components/shared/AppButton/AppButton";
import EmptyState from "@/src/components/shared/EmptyState";
import InputText from "@/src/components/shared/InputText";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import PlantImagePicker from "@/src/components/shared/PlantImagePicker";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import SingleSelect from "@/src/components/shared/SingleSelect";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import CatalogExplorerSelect from "@/src/features/mis-plantas/components/CatalogExplorerSelect";
import {
  formatDateDisplay,
  getCatalogPlantName,
  getHealthStatus,
  getStringField,
  getUserPlantId,
  getUserPlantPayload,
  healthLabels,
  healthSelectOptions,
  parseInputDate,
  resolvePlantImage,
  toIsoDate,
  useMisPlantasScreen,
} from "@/src/features/mis-plantas/hooks/useMisPlantasScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { Modal, Platform, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { createStyles } from "./styles";

const HEALTH_COLOR: Record<string, string> = {
  good: "#22c55e",
  regular: "#f59e0b",
  bad: "#ef4444",
};

function HighlightCard({ isHighlighted, children }: { isHighlighted: boolean; children: React.ReactNode }) {
  const opacity = useSharedValue(isHighlighted ? 1 : 0);

  useEffect(() => {
    if (isHighlighted) {
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(2000, withTiming(0, { duration: 500 })),
      );
    }
  }, [isHighlighted]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={{ position: "relative" }}>
      {children}
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject, // importar StyleSheet de react-native
            borderRadius: 16,
            borderWidth: 2,
            borderColor: "#22c55e",
            pointerEvents: "none",
          },
          animStyle,
        ]}
      />
    </View>
  );
}

export default function MisPlantasScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { isConnected } = useNetworkStatus();
  const isOffline = isConnected === false;
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();

  const {
    plants,
    catalog,
    editingPlantId,
    setEditingPlantId,
    isLoading,
    isRefreshing,
    isSavingEdit,
    isSavingCreate,
    showCreateForm,
    setShowCreateForm,
    showCreateDatePicker,
    setShowCreateDatePicker,
    showEditDatePicker,
    setShowEditDatePicker,
    createDatePickerValue,
    setCreateDatePickerValue,
    editDatePickerValue,
    setEditDatePickerValue,
    loadError,
    editControl,
    setEditValue,
    editErrors,
    createControl,
    setCreateValue,
    createErrors,
    selectedCatalogId,
    selectedEditCatalogId,
    selectedFavorite,
    createImagePreview,
    editImagePreview,
    createNicknameRef,
    createLocationRef,
    createNotesRef,
    editNicknameRef,
    editLocationRef,
    editNotesRef,
    editingPlant,
    hydrateEditForm,
    refresh,
    closeEditModal,
    closeCreateModal,
    onSaveEdit,
    onCreatePlant,
    healthyCount,
    favoriteCount,
  } = useMisPlantasScreen();

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header simplificado */}
        <View style={styles.headerRow}>
          <AppText variant="heading">Mi jardín</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {plants.length} {plants.length === 1 ? "planta" : "plantas"}
          </AppText>
        </View>

        {/* Stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <AppText variant="caption" style={styles.summaryLabel}>Total</AppText>
            <AppText variant="subheading" style={styles.summaryValue}>{plants.length}</AppText>
          </View>
          <View style={styles.summaryCard}>
            <AppText variant="caption" style={styles.summaryLabel}>Saludables</AppText>
            <AppText variant="subheading" style={styles.summaryValue}>{healthyCount}</AppText>
          </View>
          <View style={styles.summaryCard}>
            <AppText variant="caption" style={styles.summaryLabel}>Favoritas</AppText>
            <AppText variant="subheading" style={styles.summaryValue}>{favoriteCount}</AppText>
          </View>
          <View style={styles.summaryCard}>
            <AppText variant="caption" style={styles.summaryLabel}>Catálogo</AppText>
            <AppText variant="subheading" style={styles.summaryValue}>{catalog.length}</AppText>
          </View>
        </View>

        {isLoading ? <LoadingState message="Cargando tu jardín..." /> : null}

        {loadError ? (
          <View style={styles.errorCard}>
            <AppText variant="body" style={styles.errorCardText}>{loadError}</AppText>
            <AppButton title="Reintentar carga" variant="secondary" onPress={refresh} />
          </View>
        ) : null}

        {!isLoading ? (
          <View style={styles.gallerySection}>
            <View style={styles.listHeader}>
              <AppText variant="subheading">Galería de mi jardín</AppText>
              <Pressable onPress={refresh}>
                <AppText variant="caption" style={styles.refreshText}>
                  {isRefreshing ? "Actualizando..." : "Actualizar"}
                </AppText>
              </Pressable>
            </View>

            {!loadError && !plants.length ? (
              <EmptyState message="Aún no tienes plantas. Toca el botón verde para agregar la primera." />
            ) : (
              <View style={styles.plantList}>
                {plants.map((item) => {
                  const payload = getUserPlantPayload(item);
                  const id = getUserPlantId(item);
                  const health = getHealthStatus(payload);
                  const plantImage = resolvePlantImage(item);
                  const nickname = getStringField(payload, "nickname") || "Sin nombre";
                  const locationHome = getStringField(payload, "locationHome");
                  const isHighlighted = highlight === id;

                  return (
                    <HighlightCard key={id} isHighlighted={isHighlighted}>
                      <View style={styles.plantCard}>
                        {plantImage ? (
                          <Image source={{ uri: plantImage }} style={styles.cardImage} contentFit="cover" transition={120} />
                        ) : (
                          <View style={styles.cardImageFallback}>
                            <Ionicons name="leaf-outline" size={28} color={theme.colors.primary} />
                          </View>
                        )}
                        <View style={styles.cardBody}>
                          <AppText variant="label" numberOfLines={1}>{nickname}</AppText>
                          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
                            {getCatalogPlantName(item)}
                          </AppText>
                          <View style={styles.cardMeta}>
                            <View style={[styles.healthDot, { backgroundColor: HEALTH_COLOR[health] ?? theme.colors.primary }]} />
                            <AppText variant="caption" style={{ color: HEALTH_COLOR[health] ?? theme.colors.primary }}>
                              {healthLabels[health]}
                            </AppText>
                            {locationHome ? (
                              <View style={styles.locationChip}>
                                <Ionicons name="location-outline" size={11} color={theme.colors.textMuted} />
                                <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
                                  {locationHome}
                                </AppText>
                              </View>
                            ) : null}
                          </View>
                          <View style={styles.cardActions}>
                            <TouchableOpacity
                              style={styles.cardActionBtn}
                              activeOpacity={0.7}
                              onPress={() => router.push(`/(tabs)/misplantas/${id}` as never)}
                            >
                              <AppText variant="caption" color={theme.colors.primary}>Ver</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.cardActionBtn}
                              activeOpacity={0.7}
                              onPress={() => {
                                setShowCreateForm(false);
                                setEditingPlantId(id);
                                hydrateEditForm(item);
                              }}
                            >
                              <Ionicons name="pencil-outline" size={14} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </HighlightCard>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          if (isOffline) return;
          if (editingPlantId) { setEditingPlantId(""); hydrateEditForm(null); }
          setShowCreateForm(true);
        }}
        disabled={isOffline}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal crear planta */}
      <Modal visible={showCreateForm} transparent animationType="slide" onRequestClose={closeCreateModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.editHeaderRow}>
              <AppText variant="subheading">Añadir planta a mi jardín</AppText>
              <Pressable onPress={closeCreateModal}>
                <AppText variant="caption" style={styles.closeEditText}>Cerrar</AppText>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.fieldBlock}>
                <AppText variant="label" style={styles.fieldLabel}>Especie del catálogo</AppText>
                <CatalogExplorerSelect
                  items={catalog}
                  selectedId={selectedCatalogId}
                  onSelect={(v) => setCreateValue("plantCatalogId", v, { shouldValidate: true })}
                  errorText={createErrors.plantCatalogId?.message}
                />
              </View>

              <Controller
                control={createControl}
                name="nickname"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={createNicknameRef}
                    label="Nombre en tu jardín"
                    value={value}
                    onChangeText={onChange}
                    error={createErrors.nickname?.message}
                    placeholder="Ejemplo: Monstera grande"
                    returnKeyType="next"
                    onSubmitEditing={() => createLocationRef.current?.focus()}
                  />
                )}
              />

              <View style={styles.fieldBlock}>
                <AppText variant="label" style={styles.fieldLabel}>Imagen de tu planta</AppText>
                <Controller
                  control={createControl}
                  name="customImageUrl"
                  render={({ field: { value, onChange } }) => (
                    <PlantImagePicker value={value ?? null} onChange={(uri) => onChange(uri ?? "")} />
                  )}
                />
                {createErrors.customImageUrl?.message ? (
                  <AppText variant="caption" style={styles.errorText}>{createErrors.customImageUrl.message}</AppText>
                ) : null}
              </View>

              <Controller
                control={createControl}
                name="healthStatus"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.fieldBlock}>
                    <AppText variant="label" style={styles.fieldLabel}>Estado inicial</AppText>
                    <SingleSelect options={healthSelectOptions} value={value} onChange={onChange} />
                    {createErrors.healthStatus?.message ? (
                      <AppText variant="caption" style={styles.errorText}>{createErrors.healthStatus.message}</AppText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={createControl}
                name="locationHome"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={createLocationRef}
                    label="Ubicación"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={createErrors.locationHome?.message}
                    placeholder="Sala, balcón, ventana sur..."
                    returnKeyType="next"
                    onSubmitEditing={() => createNotesRef.current?.focus()}
                  />
                )}
              />

              <Controller
                control={createControl}
                name="acquiredDate"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.fieldBlock}>
                    <AppText variant="label" style={styles.fieldLabel}>Fecha de adquisición</AppText>
                    <Pressable
                      onPress={() => { setCreateDatePickerValue(parseInputDate(value)); setShowCreateDatePicker(true); }}
                      style={styles.dateSelector}
                    >
                      <AppText variant="body" style={styles.dateSelectorText}>{formatDateDisplay(value)}</AppText>
                      <Ionicons name="calendar-clear-outline" size={20} color={theme.colors.textSecondary} />
                    </Pressable>
                    {showCreateDatePicker ? (
                      <DateTimePicker
                        value={createDatePickerValue}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                          if (event.type === "dismissed") { setShowCreateDatePicker(false); return; }
                          const nextDate = selectedDate ?? createDatePickerValue;
                          setCreateDatePickerValue(nextDate);
                          onChange(toIsoDate(nextDate));
                          setShowCreateDatePicker(false);
                        }}
                      />
                    ) : null}
                    {value?.trim() ? (
                      <Pressable onPress={() => onChange("")} style={styles.clearDateAction}>
                        <AppText variant="caption" style={styles.clearDateText}>Limpiar fecha</AppText>
                      </Pressable>
                    ) : null}
                    {createErrors.acquiredDate?.message ? (
                      <AppText variant="caption" style={styles.errorText}>{createErrors.acquiredDate.message}</AppText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={createControl}
                name="notes"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={createNotesRef}
                    label="Notas"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={createErrors.notes?.message}
                    placeholder="Notas iniciales de cuidado"
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                )}
              />

              <Pressable
                onPress={() => setCreateValue("favorite", !selectedFavorite)}
                style={[styles.favoriteToggle, selectedFavorite && styles.favoriteToggleActive]}
              >
                <Ionicons
                  name={selectedFavorite ? "star" : "star-outline"}
                  size={20}
                  color={selectedFavorite ? theme.colors.primary : theme.colors.textSecondary}
                />
                <AppText variant="caption" style={styles.favoriteText}>Marcar como favorita</AppText>
              </Pressable>

              <AppButton
                title={isOffline ? "Sin conexión" : isSavingCreate ? "Guardando..." : "Añadir a mi jardín"}
                onPress={onCreatePlant}
                disabled={isSavingCreate || isOffline}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal editar planta */}
      <Modal visible={Boolean(editingPlant)} transparent animationType="slide" onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.editHeaderRow}>
              <AppText variant="subheading">Editar planta</AppText>
              <Pressable onPress={closeEditModal}>
                <AppText variant="caption" style={styles.closeEditText}>Cerrar</AppText>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.fieldBlock}>
                <AppText variant="label" style={styles.fieldLabel}>Especie del catálogo</AppText>
                <CatalogExplorerSelect
                  items={catalog}
                  selectedId={selectedEditCatalogId}
                  onSelect={(v) => setEditValue("plantCatalogId", v, { shouldValidate: true })}
                  errorText={editErrors.plantCatalogId?.message}
                />
              </View>

              <Controller
                control={editControl}
                name="nickname"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={editNicknameRef}
                    label="Nombre"
                    value={value}
                    onChangeText={onChange}
                    error={editErrors.nickname?.message}
                    placeholder="Ejemplo: Mi Monstera"
                    returnKeyType="next"
                    onSubmitEditing={() => editLocationRef.current?.focus()}
                  />
                )}
              />

              <View style={styles.fieldBlock}>
                <AppText variant="label" style={styles.fieldLabel}>Imagen de tu planta</AppText>
                <Controller
                  control={editControl}
                  name="customImageUrl"
                  render={({ field: { value, onChange } }) => (
                    <PlantImagePicker value={value ?? null} onChange={(uri) => onChange(uri ?? "")} />
                  )}
                />
                {editErrors.customImageUrl?.message ? (
                  <AppText variant="caption" style={styles.errorText}>{editErrors.customImageUrl.message}</AppText>
                ) : null}
              </View>

              <Controller
                control={editControl}
                name="healthStatus"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.fieldBlock}>
                    <AppText variant="label" style={styles.fieldLabel}>Estado de salud</AppText>
                    <SingleSelect options={healthSelectOptions} value={value} onChange={onChange} />
                    {editErrors.healthStatus?.message ? (
                      <AppText variant="caption" style={styles.errorText}>{editErrors.healthStatus.message}</AppText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={editControl}
                name="locationHome"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={editLocationRef}
                    label="Ubicación"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={editErrors.locationHome?.message}
                    placeholder="Ejemplo: Sala, ventana norte"
                    returnKeyType="next"
                    onSubmitEditing={() => editNotesRef.current?.focus()}
                  />
                )}
              />

              <Controller
                control={editControl}
                name="acquiredDate"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.fieldBlock}>
                    <AppText variant="label" style={styles.fieldLabel}>Fecha de adquisición</AppText>
                    <Pressable
                      onPress={() => { setEditDatePickerValue(parseInputDate(value)); setShowEditDatePicker(true); }}
                      style={styles.dateSelector}
                    >
                      <AppText variant="body" style={styles.dateSelectorText}>{formatDateDisplay(value)}</AppText>
                      <Ionicons name="calendar-clear-outline" size={20} color={theme.colors.textSecondary} />
                    </Pressable>
                    {showEditDatePicker ? (
                      <DateTimePicker
                        value={editDatePickerValue}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                          if (event.type === "dismissed") { setShowEditDatePicker(false); return; }
                          const nextDate = selectedDate ?? editDatePickerValue;
                          setEditDatePickerValue(nextDate);
                          onChange(toIsoDate(nextDate));
                          setShowEditDatePicker(false);
                        }}
                      />
                    ) : null}
                    {value?.trim() ? (
                      <Pressable onPress={() => onChange("")} style={styles.clearDateAction}>
                        <AppText variant="caption" style={styles.clearDateText}>Limpiar fecha</AppText>
                      </Pressable>
                    ) : null}
                    {editErrors.acquiredDate?.message ? (
                      <AppText variant="caption" style={styles.errorText}>{editErrors.acquiredDate.message}</AppText>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={editControl}
                name="notes"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={editNotesRef}
                    label="Notas"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={editErrors.notes?.message}
                    placeholder="Notas de cuidado"
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                )}
              />

              <AppButton
                title={isOffline ? "Sin conexión" : isSavingEdit ? "Guardando..." : "Guardar cambios"}
                onPress={onSaveEdit}
                disabled={isSavingEdit || isOffline}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
```

**Nota:** El componente `HighlightCard` usa `StyleSheet` de React Native — añadir al import:
```ts
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
```

También importar `Animated` de `react-native-reanimated`:
```ts
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";
```

El `HighlightCard` debe vivir fuera del componente `MisPlantasScreen` en el mismo archivo, antes de la función principal.

- [ ] **Step 8: Verificar TypeScript**

```
cd mobile && npx tsc --noEmit
```
Esperado: sin errores. Si hay error en `favoriteCount` (no exportado de `useMisPlantasScreen`), verificar que el Step 4 de 9a fue aplicado.

- [ ] **Step 9: Prueba de flujo completo en dev**

1. Navega a "Mi jardín" — debe mostrar cards horizontales con dot de salud
2. Toca "Ver" en una card — debe navegar a PlantDetailScreen con la info de la planta
3. Toca el FAB verde — debe abrir el modal de crear planta con `PlantImagePicker` en lugar de campo de URL
4. Desde "Identificar", escanea → analiza → guarda → debe navegar a "Mi jardín" con la planta nueva resaltada brevemente

- [ ] **Step 10: Commit final**

```
git add src/features/mis-plantas/ src/store/plants.store.ts
git commit -m "feat: MisPlantasScreen redesign — cards horizontales, FAB, highlight, PlantImagePicker, PlantDetailScreen integrado"
```

---

## Self-Review del plan

**Spec coverage:**
- ✅ EmptyState mejorado — Task 6
- ✅ IdentificarPhotoPreview state machine (idle/analyzing/result/saved) — Task 7
- ✅ SavePlantSheet con nickname + ubicación pre-llenada — Task 4 + 7
- ✅ Estado saved post-guardado con CTA al jardín — Task 7 + 8 (hook)
- ✅ Navegación post-guardado con highlight param — Task 8 (useIdentificarScreen) + Task 9
- ✅ Cards horizontales con badge de salud coloreado — Task 9
- ✅ FAB reemplaza botón de header — Task 9
- ✅ Header simplificado con contador — Task 9
- ✅ PlantDetailScreen con hero, cuidados, mi planta — Task 5
- ✅ Ruta dinámica [id] — Task 1 + 5
- ✅ PlantImagePicker reemplaza URL manual — Task 3 + 9
- ✅ plants.store compartido entre MisPlantasScreen y PlantDetailScreen — Task 2 + 9
- ✅ Highlight animado de planta nueva — Task 9
- ✅ Favoritas en stats — Task 9 (9a)
- ✅ Compatibilidad offline (botones deshabilitados) — mantenido en todos los componentes

**Sin delete API:** `PlantDetailScreen` no tiene botón de eliminar (no existe endpoint en el backend).

**Dependencias entre tasks:**
- Task 2 (plants.store) debe ir antes de Task 5 (PlantDetailScreen lo usa) y Task 9 (MisPlantasScreen lo sincroniza)
- Task 3 (PlantImagePicker) antes de Task 9 (MisPlantasScreen lo usa)
- Task 4 (SavePlantSheet) antes de Task 7 (useIdentificarScreen lo importa)
- Task 7 antes de Task 8 (IdentificarScreen usa nuevas props del hook)
