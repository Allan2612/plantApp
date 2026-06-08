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
  getHealthStatus,
  getStringField,
  getUserPlantId,
  getUserPlantPayload,
  healthSelectOptions,
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
    refreshing,
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
    hydrateEditForm,
    refresh,
    onRefresh,
    closeEditModal,
    closeCreateModal,
    onSaveEdit,
    onCreatePlant,
  } = useMisPlantasScreen();


  const goodCount = plants.filter(
    (p) => getHealthStatus(getUserPlantPayload(p)) === "good"
  ).length;
  const attentionCount = plants.length - goodCount;
  const totalColor = theme.colors.primary;
  const goodColor = "#22c55e";
  const attentionColor = attentionCount > 0 ? "#f59e0b" : "#22c55e";

  const ListHeader = (
    <View style={styles.header}>
      <AppText variant="heading">Mi jardín</AppText>
      {plants.length > 0 ? (
        <View style={styles.dashboardRow}>
          <View style={styles.dashboardStat}>
            <Ionicons name="leaf-outline" size={13} color={totalColor} />
            <AppText style={[styles.dashboardValue, { color: totalColor }]}>{plants.length}</AppText>
            <AppText style={styles.dashboardLabel}>{plants.length === 1 ? "planta" : "plantas"}</AppText>
          </View>
          <View style={styles.dashboardStat}>
            <Ionicons name="checkmark-circle-outline" size={13} color={goodColor} />
            <AppText style={[styles.dashboardValue, { color: goodColor }]}>{goodCount}</AppText>
            <AppText style={styles.dashboardLabel}>sanas</AppText>
          </View>
          {attentionCount > 0 ? (
            <View style={styles.dashboardStat}>
              <Ionicons name="warning-outline" size={13} color={attentionColor} />
              <AppText style={[styles.dashboardValue, { color: attentionColor }]}>{attentionCount}</AppText>
              <AppText style={styles.dashboardLabel}>atención</AppText>
            </View>
          ) : null}
        </View>
      ) : (
        <AppText variant="caption" color={theme.colors.textSecondary}>
          Agrega tu primera planta con el botón verde
        </AppText>
      )}
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
          const locationHome = getStringField(payload, "locationHome");

          return (
            <View style={styles.cardWrapper}>
              <PlantGridCard
                nickname={nickname}
                imageUri={imageUri}
                health={health as "good" | "regular" | "bad"}
                locationHome={locationHome}
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
        refreshing={refreshing}
        onRefresh={onRefresh}
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
