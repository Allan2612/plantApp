# Mi Jardín Grid Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the horizontal card list in MisPlantasScreen with a 2-column Pinterest-style grid using a new `PlantGridCard` component.

**Architecture:** Create isolated `PlantGridCard` component (Pressable + expo-image 3:4 + overlay + health dot). Replace `ScrollView`+card-list in `MisPlantasScreen` with `FlatList numColumns={2}`. Remove stats row and `HighlightCard`/Reanimated, replace highlight with simple `useState`+`setTimeout`.

**Tech Stack:** React Native FlatList, expo-image, Ionicons, design system tokens (colors/spacing/radius), TypeScript

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `mobile/src/features/mis-plantas/components/PlantGridCard/PlantGridCard.tsx` | Visual card component for grid |
| Create | `mobile/src/features/mis-plantas/components/PlantGridCard/styles.ts` | Card styles |
| Create | `mobile/src/features/mis-plantas/components/PlantGridCard/index.ts` | Re-export |
| Modify | `mobile/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx` | Replace ScrollView+HighlightCard+stats with FlatList+PlantGridCard |
| Modify | `mobile/src/features/mis-plantas/screens/MisPlantasScreen/styles.ts` | Remove horizontal card styles, add listContent/cardWrapper |

---

## Task 1: Create PlantGridCard component

**Files:**
- Create: `mobile/src/features/mis-plantas/components/PlantGridCard/styles.ts`
- Create: `mobile/src/features/mis-plantas/components/PlantGridCard/PlantGridCard.tsx`
- Create: `mobile/src/features/mis-plantas/components/PlantGridCard/index.ts`

- [ ] **Step 1: Create styles.ts**

```ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme, cardWidth: number) {
  return StyleSheet.create({
    pressable: {
      width: cardWidth,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    highlighted: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    image: {
      width: cardWidth,
      aspectRatio: 3 / 4,
      backgroundColor: colors.surfaceAlt,
    },
    fallback: {
      width: cardWidth,
      aspectRatio: 3 / 4,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "45%",
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
    },
    nickname: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    healthDot: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#FFFFFF",
    },
  });
}
```

- [ ] **Step 2: Create PlantGridCard.tsx**

```tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Dimensions, Pressable, View } from "react-native";
import { createStyles } from "./styles";
import { Spacing } from "@/src/constants/spacing";

const CARD_WIDTH =
  (Dimensions.get("window").width - Spacing.md * 2 - Spacing.sm) / 2;

const HEALTH_DOT_COLOR: Record<string, string> = {
  good: "#22c55e",
  regular: "#f59e0b",
  bad: "#ef4444",
};

interface PlantGridCardProps {
  nickname: string;
  imageUri: string | null;
  health: "good" | "regular" | "bad";
  isHighlighted?: boolean;
  onPress: () => void;
}

export default function PlantGridCard({
  nickname,
  imageUri,
  health,
  isHighlighted = false,
  onPress,
}: PlantGridCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, CARD_WIDTH);
  const dotColor = HEALTH_DOT_COLOR[health] ?? "#22c55e";

  return (
    <Pressable
      style={[styles.pressable, isHighlighted && styles.highlighted]}
      onPress={onPress}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <View style={styles.fallback}>
          <Ionicons name="leaf-outline" size={36} color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.overlay}>
        <AppText variant="label" style={styles.nickname} numberOfLines={2}>
          {nickname}
        </AppText>
      </View>

      <View style={[styles.healthDot, { backgroundColor: dotColor }]} />
    </Pressable>
  );
}
```

- [ ] **Step 3: Create index.ts**

```ts
export { default } from "./PlantGridCard";
```

- [ ] **Step 4: Verify TypeScript — no new errors**

Run: `cd mobile && npx tsc --noEmit 2>&1 | head -40`

Expected: zero new errors related to PlantGridCard files.

---

## Task 2: Rewrite MisPlantasScreen styles.ts

**Files:**
- Modify: `mobile/src/features/mis-plantas/screens/MisPlantasScreen/styles.ts`

- [ ] **Step 1: Replace the full styles.ts**

The new file keeps: `container`, `headerRow`, `errorCard`, `errorCardText`, FAB block, modal block (all modal-related styles). Removes: `summaryRow`, `summaryCard`, `summaryLabel`, `summaryValue`, `gallerySection`, `listHeader`, `refreshText`, `plantList`, `plantCard`, `cardImage`, `cardImageFallback`, `cardBody`, `cardMeta`, `healthDot`, `locationChip`, `cardActions`, `cardActionBtn`, `previewWrap`, `previewImage`. Adds: `listContent`, `header`, `cardWrapper`.

```ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    // Root list
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl + spacing.xl,
    },
    header: {
      paddingBottom: spacing.md,
      paddingTop: spacing.xl,
    },
    cardWrapper: {
      flex: 1,
    },
    // Error
    errorCard: {
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    errorCardText: {
      color: colors.danger,
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
  });
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd mobile && npx tsc --noEmit 2>&1 | head -40`

Expected: zero errors from styles.ts.

---

## Task 3: Rewrite MisPlantasScreen.tsx

**Files:**
- Modify: `mobile/src/features/mis-plantas/screens/MisPlantasScreen/MisPlantasScreen.tsx`

- [ ] **Step 1: Replace full MisPlantasScreen.tsx**

Key changes vs current:
1. Remove `Animated`, `useAnimatedStyle`, `useSharedValue`, `withDelay`, `withSequence`, `withTiming` imports (entire `react-native-reanimated` import)
2. Remove `HighlightCard` component
3. Remove `StyleSheet` import (no longer used directly)
4. Add `FlatList`, `Dimensions` imports
5. Add `PlantGridCard` import
6. Add `useState`, keep `useEffect`
7. Replace `ScrollView`+plant map loop with `FlatList numColumns={2}`
8. Remove stats row
9. Add `highlight` → `isHighlightedId` state with `useEffect` + `setTimeout(2000)` clear
10. Keep FAB, both Modals unchanged

```tsx
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
import PlantGridCard from "@/src/features/mis-plantas/components/PlantGridCard";
import {
  formatDateDisplay,
  getCatalogPlantName,
  getHealthStatus,
  getStringField,
  getUserPlantId,
  getUserPlantPayload,
  healthSelectOptions,
  parseInputDate,
  resolvePlantImage,
  toIsoDate,
  useMisPlantasScreen,
} from "@/src/features/mis-plantas/hooks/useMisPlantasScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { createStyles } from "./styles";

export default function MisPlantasScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { isConnected } = useNetworkStatus();
  const isOffline = isConnected === false;
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();

  const [isHighlightedId, setIsHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (highlight) {
      setIsHighlightedId(highlight);
      const timer = setTimeout(() => setIsHighlightedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlight]);

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
  } = useMisPlantasScreen();

  const ListHeader = (
    <View style={styles.header}>
      <AppText variant="heading">Mi jardín</AppText>
      <AppText variant="caption" color={theme.colors.textSecondary}>
        {plants.length} {plants.length === 1 ? "planta" : "plantas"}
      </AppText>
      {loadError ? (
        <View style={styles.errorCard}>
          <AppText variant="body" style={styles.errorCardText}>{loadError}</AppText>
          <AppButton title="Reintentar carga" variant="secondary" onPress={refresh} />
        </View>
      ) : null}
    </View>
  );

  return (
    <ScreenWrapper>
      <FlatList
        data={plants}
        numColumns={2}
        keyExtractor={(item) => getUserPlantId(item)}
        renderItem={({ item }) => {
          const payload = getUserPlantPayload(item);
          const id = getUserPlantId(item);
          const health = getHealthStatus(payload);
          const imageUri = resolvePlantImage(item);
          const nickname = getStringField(payload, "nickname") || "Sin nombre";

          return (
            <View style={styles.cardWrapper}>
              <PlantGridCard
                nickname={nickname}
                imageUri={imageUri}
                health={health as "good" | "regular" | "bad"}
                isHighlighted={isHighlightedId === id}
                onPress={() => router.push(`/(tabs)/misplantas/${id}` as never)}
              />
            </View>
          );
        }}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading
            ? <LoadingState message="Cargando tu jardín..." />
            : <EmptyState message="Aún no tienes plantas. Toca el botón verde para agregar la primera." />
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          if (isOffline) return;
          if (editingPlantId) {
            setEditingPlantId("");
            hydrateEditForm(null);
          }
          setShowCreateForm(true);
        }}
        disabled={isOffline}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal crear planta */}
      <Modal
        visible={showCreateForm}
        transparent
        animationType="slide"
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.editHeaderRow}>
              <AppText variant="subheading">Añadir planta a mi jardín</AppText>
              <Pressable onPress={closeCreateModal}>
                <AppText variant="caption" style={styles.closeEditText}>Cerrar</AppText>
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
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
                    <PlantImagePicker
                      value={value ?? null}
                      onChange={(uri) => onChange(uri ?? "")}
                    />
                  )}
                />
                {createErrors.customImageUrl?.message ? (
                  <AppText variant="caption" style={styles.errorText}>
                    {createErrors.customImageUrl.message}
                  </AppText>
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
                      <AppText variant="caption" style={styles.errorText}>
                        {createErrors.healthStatus.message}
                      </AppText>
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
                    label="Ubicación (opcional)"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={createErrors.locationHome?.message}
                    placeholder="Sala, balcón, ventana sur..."
                    returnKeyType="next"
                    onSubmitEditing={() => createNotesRef.current?.focus()}
                  />
                )}
              />

              <View style={styles.fieldBlock}>
                <AppText variant="label" style={styles.fieldLabel}>Fecha de adquisición</AppText>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowCreateDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.dateSelectorText}
                  >
                    {createDatePickerValue
                      ? formatDateDisplay(toIsoDate(createDatePickerValue))
                      : "Seleccionar fecha"}
                  </AppText>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {showCreateDatePicker ? (
                  <DateTimePicker
                    value={createDatePickerValue ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                      setShowCreateDatePicker(false);
                      if (selectedDate) {
                        setCreateDatePickerValue(selectedDate);
                        setCreateValue("acquiredDate", toIsoDate(selectedDate), {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                ) : null}
                {createDatePickerValue ? (
                  <TouchableOpacity
                    style={styles.clearDateAction}
                    onPress={() => {
                      setCreateDatePickerValue(new Date());
                      setCreateValue("acquiredDate", "", { shouldValidate: false });
                    }}
                  >
                    <AppText variant="caption" style={styles.clearDateText}>
                      Quitar fecha
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>

              <Controller
                control={createControl}
                name="notes"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={createNotesRef}
                    label="Notas (opcional)"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={createErrors.notes?.message}
                    placeholder="Riega cada 3 días, necesita luz indirecta..."
                    multiline
                  />
                )}
              />

              <Controller
                control={createControl}
                name="favorite"
                render={({ field: { value, onChange } }) => (
                  <TouchableOpacity
                    style={[styles.favoriteToggle, value ? styles.favoriteToggleActive : null]}
                    onPress={() => onChange(!value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={value ? "heart" : "heart-outline"}
                      size={18}
                      color={value ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <AppText
                      variant="caption"
                      style={[styles.favoriteText, value ? { color: theme.colors.primary } : null]}
                    >
                      {value ? "Marcada como favorita" : "Marcar como favorita"}
                    </AppText>
                  </TouchableOpacity>
                )}
              />

              <AppButton
                title={isSavingCreate ? "Guardando..." : "Añadir al jardín"}
                onPress={onCreatePlant}
                disabled={isSavingCreate || isOffline}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal editar planta */}
      <Modal
        visible={Boolean(editingPlantId)}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.editHeaderRow}>
              <AppText variant="subheading">Editar planta</AppText>
              <Pressable onPress={closeEditModal}>
                <AppText variant="caption" style={styles.closeEditText}>Cerrar</AppText>
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
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
                    label="Nombre en tu jardín"
                    value={value}
                    onChangeText={onChange}
                    error={editErrors.nickname?.message}
                    placeholder="Ejemplo: Monstera grande"
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
                    <PlantImagePicker
                      value={value ?? null}
                      onChange={(uri) => onChange(uri ?? "")}
                    />
                  )}
                />
                {editErrors.customImageUrl?.message ? (
                  <AppText variant="caption" style={styles.errorText}>
                    {editErrors.customImageUrl.message}
                  </AppText>
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
                      <AppText variant="caption" style={styles.errorText}>
                        {editErrors.healthStatus.message}
                      </AppText>
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
                    label="Ubicación (opcional)"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={editErrors.locationHome?.message}
                    placeholder="Sala, balcón, ventana sur..."
                    returnKeyType="next"
                    onSubmitEditing={() => editNotesRef.current?.focus()}
                  />
                )}
              />

              <View style={styles.fieldBlock}>
                <AppText variant="label" style={styles.fieldLabel}>Fecha de adquisición</AppText>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowEditDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.dateSelectorText}
                  >
                    {editDatePickerValue
                      ? formatDateDisplay(toIsoDate(editDatePickerValue))
                      : "Seleccionar fecha"}
                  </AppText>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {showEditDatePicker ? (
                  <DateTimePicker
                    value={editDatePickerValue ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                      setShowEditDatePicker(false);
                      if (selectedDate) {
                        setEditDatePickerValue(selectedDate);
                        setEditValue("acquiredDate", toIsoDate(selectedDate), {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                ) : null}
                {editDatePickerValue ? (
                  <TouchableOpacity
                    style={styles.clearDateAction}
                    onPress={() => {
                      setEditDatePickerValue(new Date());
                      setEditValue("acquiredDate", "", { shouldValidate: false });
                    }}
                  >
                    <AppText variant="caption" style={styles.clearDateText}>
                      Quitar fecha
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>

              <Controller
                control={editControl}
                name="notes"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={editNotesRef}
                    label="Notas (opcional)"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={editErrors.notes?.message}
                    placeholder="Riega cada 3 días, necesita luz indirecta..."
                    multiline
                  />
                )}
              />

              <AppButton
                title={isSavingEdit ? "Guardando..." : "Guardar cambios"}
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

- [ ] **Step 2: Verify TypeScript**

Run: `cd mobile && npx tsc --noEmit 2>&1 | head -60`

Expected: zero new errors related to MisPlantasScreen.

---

## Spec Self-Review

**Coverage check:**
- [x] PlantGridCard component with correct props
- [x] 3:4 aspect ratio image via expo-image
- [x] Semi-transparent overlay `rgba(0,0,0,0.55)` height 45%
- [x] Health dot absolute top-right with white border
- [x] Fallback view with `leaf-outline` icon
- [x] `isHighlighted` → border colors.primary 2px
- [x] Highlight clears after 2000ms via `useState`+`setTimeout`
- [x] Stats row removed
- [x] `HighlightCard` + Reanimated removed
- [x] FlatList numColumns=2
- [x] CARD_WIDTH formula exact
- [x] FAB unchanged
- [x] Both modals unchanged
- [x] No new dependencies

**Type consistency check:**
- `PlantGridCardProps.health` is `"good" | "regular" | "bad"` in Task 1 → cast in Task 3 matches
- `createStyles(theme, cardWidth)` takes two args in Task 1 styles → called correctly in PlantGridCard.tsx
- `getUserPlantId`, `getUserPlantPayload`, `getHealthStatus`, `resolvePlantImage`, `getStringField` — all imported from hook, same names as current screen
