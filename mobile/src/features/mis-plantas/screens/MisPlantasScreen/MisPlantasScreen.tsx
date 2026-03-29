import AppButton from "@/src/components/shared/AppButton/AppButton";
import EmptyState from "@/src/components/shared/EmptyState";
import InputText from "@/src/components/shared/InputText";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import PressableCard from "@/src/components/shared/PressableCard/PressableCard";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import SingleSelect from "@/src/components/shared/SingleSelect";
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
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { Modal, Platform, Pressable, ScrollView, View } from "react-native";

import { createStyles } from "./styles";

export default function MisPlantasScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
    createImageRef,
    createLocationRef,
    createNotesRef,
    editNicknameRef,
    editImageRef,
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
  } = useMisPlantasScreen();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <AppText variant="heading">Mi jardín</AppText>
            <AppText variant="caption" style={styles.subtitle}>
              Selecciona especie del catálogo, sube foto de tu planta y administra todo en tarjetas.
            </AppText>
          </View>

          <AppButton
            title={showCreateForm ? "Cerrar" : "Añadir a mi jardín"}
            onPress={() => {
              if (showCreateForm) {
                closeCreateModal();
              } else {
                setShowCreateForm(true);
              }
              if (editingPlantId) {
                setEditingPlantId("");
                hydrateEditForm(null);
              }
            }}
            variant={showCreateForm ? "secondary" : "primary"}
          />
        </View>

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
              <EmptyState message="Aún no tienes plantas en tu jardín. Usa Añadir a mi jardín para registrar la primera." />
            ) : (
              <View style={styles.galleryGrid}>
                {plants.map((item) => {
                  const payload = getUserPlantPayload(item);
                  const id = getUserPlantId(item);
                  const health = getHealthStatus(payload);
                  const plantImage = resolvePlantImage(item);

                  return (
                    <PressableCard key={id} style={styles.galleryCard} border={false}>
                      <View style={styles.imageFrame}>
                        {plantImage ? (
                          <Image source={{ uri: plantImage }} style={styles.image} contentFit="cover" transition={120} />
                        ) : (
                          <View style={styles.imageFallback}>
                            <Ionicons name="leaf-outline" size={theme.spacing.xl} color={theme.colors.primary} />
                          </View>
                        )}
                      </View>

                      <View style={styles.cardBody}>
                        <AppText variant="label" numberOfLines={1}>
                          {getStringField(payload, "nickname") || "Sin nombre"}
                        </AppText>
                        <AppText variant="caption" style={styles.metaText} numberOfLines={1}>
                          {getCatalogPlantName(item)}
                        </AppText>
                        <AppText variant="caption" style={styles.healthBadge}>
                          Salud: {healthLabels[health]}
                        </AppText>

                        <AppButton
                          title="Editar"
                          variant="secondary"
                          onPress={() => {
                            setShowCreateForm(false);
                            setEditingPlantId(id);
                            hydrateEditForm(item);
                          }}
                        />
                      </View>
                    </PressableCard>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

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
                  onSelect={(nextValue) => setCreateValue("plantCatalogId", nextValue, { shouldValidate: true })}
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
                    onSubmitEditing={() => createImageRef.current?.focus()}
                  />
                )}
              />

              <Controller
                control={createControl}
                name="customImageUrl"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={createImageRef}
                    label="Imagen de tu planta"
                    value={value}
                    onChangeText={onChange}
                    error={createErrors.customImageUrl?.message}
                    placeholder="https://... o file://..."
                    returnKeyType="next"
                    onSubmitEditing={() => createLocationRef.current?.focus()}
                  />
                )}
              />

              {createImagePreview ? (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: createImagePreview }} style={styles.previewImage} contentFit="cover" transition={120} />
                </View>
              ) : null}

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
                      onPress={() => {
                        const initialDate = parseInputDate(value);
                        setCreateDatePickerValue(initialDate);
                        setShowCreateDatePicker(true);
                      }}
                      style={styles.dateSelector}
                    >
                      <AppText variant="body" style={styles.dateSelectorText}>
                        {formatDateDisplay(value)}
                      </AppText>
                      <Ionicons
                        name="calendar-clear-outline"
                        size={theme.spacing.md + theme.spacing.xs}
                        color={theme.colors.textSecondary}
                      />
                    </Pressable>

                    {showCreateDatePicker ? (
                      <DateTimePicker
                        value={createDatePickerValue}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                          if (event.type === "dismissed") {
                            setShowCreateDatePicker(false);
                            return;
                          }

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
                  size={theme.spacing.md + theme.spacing.xs}
                  color={selectedFavorite ? theme.colors.primary : theme.colors.textSecondary}
                />
                <AppText variant="caption" style={styles.favoriteText}>
                  Marcar como favorita
                </AppText>
              </Pressable>

              <AppButton
                title={isSavingCreate ? "Guardando..." : "Añadir a mi jardín"}
                onPress={onCreatePlant}
                disabled={isSavingCreate}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(editingPlant)}
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
                  onSelect={(nextValue) =>
                    setEditValue("plantCatalogId", nextValue, { shouldValidate: true })
                  }
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
                    onSubmitEditing={() => editImageRef.current?.focus()}
                  />
                )}
              />

              <Controller
                control={editControl}
                name="customImageUrl"
                render={({ field: { value, onChange } }) => (
                  <InputText
                    ref={editImageRef}
                    label="Imagen de tu planta"
                    value={value ?? ""}
                    onChangeText={onChange}
                    error={editErrors.customImageUrl?.message}
                    placeholder="https://... o file://..."
                    returnKeyType="next"
                    onSubmitEditing={() => editLocationRef.current?.focus()}
                  />
                )}
              />

              {editImagePreview ? (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: editImagePreview }} style={styles.previewImage} contentFit="cover" transition={120} />
                </View>
              ) : null}

              <Controller
                control={editControl}
                name="healthStatus"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.fieldBlock}>
                    <AppText variant="label" style={styles.fieldLabel}>Estado de salud</AppText>
                    <SingleSelect
                      options={healthSelectOptions}
                      value={value}
                      onChange={onChange}
                    />
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
                      onPress={() => {
                        const initialDate = parseInputDate(value);
                        setEditDatePickerValue(initialDate);
                        setShowEditDatePicker(true);
                      }}
                      style={styles.dateSelector}
                    >
                      <AppText variant="body" style={styles.dateSelectorText}>
                        {formatDateDisplay(value)}
                      </AppText>
                      <Ionicons
                        name="calendar-clear-outline"
                        size={theme.spacing.md + theme.spacing.xs}
                        color={theme.colors.textSecondary}
                      />
                    </Pressable>

                    {showEditDatePicker ? (
                      <DateTimePicker
                        value={editDatePickerValue}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                          if (event.type === "dismissed") {
                            setShowEditDatePicker(false);
                            return;
                          }

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
                title={isSavingEdit ? "Guardando..." : "Guardar cambios"}
                onPress={onSaveEdit}
                disabled={isSavingEdit}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
