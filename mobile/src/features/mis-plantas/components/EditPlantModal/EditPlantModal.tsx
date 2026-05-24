import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import InputText from "@/src/components/shared/InputText";
import PlantImagePicker from "@/src/components/shared/PlantImagePicker";
import SingleSelect from "@/src/components/shared/SingleSelect";
import { fetchCatalogPlants } from "@/src/features/catalogo/services/catalogoApi.service";
import CatalogExplorerSelect from "@/src/features/mis-plantas/components/CatalogExplorerSelect";
import {
  EditPlantValues,
  editPlantSchema,
  formatDateDisplay,
  formatDateInput,
  getHealthStatus,
  getStringField,
  getUserPlantId,
  getUserPlantPayload,
  healthSelectOptions,
  resolvePlantImage,
  toIsoDate,
} from "@/src/features/mis-plantas/hooks/useMisPlantasScreen";
import { updateUserPlant, UserPlantListItem } from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { uploadUserPlantImage } from "@/src/services/imageUpload.service";
import { useToast } from "@/src/providers/ToastProvider";
import { cacheGet } from "@/src/services/offlineCache";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface EditPlantModalProps {
  visible: boolean;
  item: UserPlantListItem;
  onClose: () => void;
  onSaved: () => void;
  isOffline: boolean;
}

export default function EditPlantModal({
  visible,
  item,
  onClose,
  onSaved,
  isOffline,
}: EditPlantModalProps) {
  const theme = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { showToast } = useToast();
  const styles = createStyles(theme as Parameters<typeof createStyles>[0]);

  const [catalog, setCatalog] = useState<PlantCatalogItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());

  const nicknameRef = useRef<import("react-native").TextInput | null>(null);
  const locationRef = useRef<import("react-native").TextInput | null>(null);
  const notesRef = useRef<import("react-native").TextInput | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditPlantValues>({
    resolver: zodResolver(editPlantSchema),
    defaultValues: {
      plantCatalogId: "",
      nickname: "",
      customImageUrl: "",
      healthStatus: "good",
      locationHome: "",
      acquiredDate: "",
      notes: "",
    },
  });

  const selectedCatalogId = watch("plantCatalogId");

  useEffect(() => {
    cacheGet<PlantCatalogItem[]>("plantica:catalog").then((cached) => {
      if (cached?.length) setCatalog(cached);
    });
    fetchCatalogPlants()
      .then(setCatalog)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) return;
    const payload = getUserPlantPayload(item);
    const acquiredDate = formatDateInput(getStringField(payload, "acquiredDate"));
    reset({
      plantCatalogId: getStringField(payload, "plantCatalogId"),
      nickname: getStringField(payload, "nickname"),
      customImageUrl: resolvePlantImage(item),
      healthStatus: getHealthStatus(payload),
      locationHome: getStringField(payload, "locationHome"),
      acquiredDate,
      notes: getStringField(payload, "notes"),
    });
    if (acquiredDate) {
      const [y, m, d] = acquiredDate.split("-").map(Number);
      setDatePickerValue(new Date(y, m - 1, d));
    } else {
      setDatePickerValue(new Date());
    }
  }, [visible, item, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const plantId = getUserPlantId(item);
    if (!plantId) {
      showToast("No se encontró el identificador de la planta.", "error");
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl = values.customImageUrl || undefined;
      if (imageUrl) {
        imageUrl = await uploadUserPlantImage(plantId, imageUrl);
      }
      await updateUserPlant(plantId, {
        plantCatalogId: values.plantCatalogId,
        nickname: values.nickname,
        customImageUrl: imageUrl,
        healthStatus: values.healthStatus,
        locationHome: values.locationHome || undefined,
        acquiredDate: values.acquiredDate || undefined,
        notes: values.notes || undefined,
      });
      showToast("Planta actualizada correctamente.", "success");
      onSaved();
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo actualizar la planta.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <AppText variant="subheading">Editar planta</AppText>
            <Pressable onPress={onClose}>
              <AppText variant="caption" style={{ color: colors.primary }}>Cerrar</AppText>
            </Pressable>
          </View>

          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.fieldBlock}>
              <AppText variant="label" style={{ color: colors.textPrimary }}>Especie del catálogo</AppText>
              <CatalogExplorerSelect
                items={catalog}
                selectedId={selectedCatalogId}
                onSelect={(v) => setValue("plantCatalogId", v, { shouldValidate: true })}
                errorText={errors.plantCatalogId?.message}
              />
            </View>

            <Controller
              control={control}
              name="nickname"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={nicknameRef}
                  label="Nombre en tu jardín"
                  value={value}
                  onChangeText={onChange}
                  error={errors.nickname?.message}
                  placeholder="Ejemplo: Monstera grande"
                  returnKeyType="next"
                  onSubmitEditing={() => locationRef.current?.focus()}
                />
              )}
            />

            <View style={styles.fieldBlock}>
              <AppText variant="label" style={{ color: colors.textPrimary }}>Imagen de tu planta</AppText>
              <Controller
                control={control}
                name="customImageUrl"
                render={({ field: { value, onChange } }) => (
                  <PlantImagePicker
                    value={value ?? null}
                    onChange={(uri) => onChange(uri ?? "")}
                  />
                )}
              />
              {errors.customImageUrl?.message ? (
                <AppText variant="caption" style={{ color: colors.danger }}>
                  {errors.customImageUrl.message}
                </AppText>
              ) : null}
            </View>

            <Controller
              control={control}
              name="healthStatus"
              render={({ field: { value, onChange } }) => (
                <View style={styles.fieldBlock}>
                  <AppText variant="label" style={{ color: colors.textPrimary }}>Estado de salud</AppText>
                  <SingleSelect options={healthSelectOptions} value={value} onChange={onChange} />
                  {errors.healthStatus?.message ? (
                    <AppText variant="caption" style={{ color: colors.danger }}>
                      {errors.healthStatus.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="locationHome"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={locationRef}
                  label="Ubicación (opcional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.locationHome?.message}
                  placeholder="Sala, balcón, ventana sur..."
                  returnKeyType="next"
                  onSubmitEditing={() => notesRef.current?.focus()}
                />
              )}
            />

            <View style={styles.fieldBlock}>
              <AppText variant="label" style={{ color: colors.textPrimary }}>Fecha de adquisición</AppText>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <AppText variant="body" color={colors.textSecondary} style={{ flex: 1 }}>
                  {datePickerValue
                    ? formatDateDisplay(toIsoDate(datePickerValue))
                    : "Seleccionar fecha"}
                </AppText>
                <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              {showDatePicker ? (
                <DateTimePicker
                  value={datePickerValue}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDatePickerValue(selectedDate);
                      setValue("acquiredDate", toIsoDate(selectedDate), { shouldValidate: true });
                    }
                  }}
                />
              ) : null}
            </View>

            <Controller
              control={control}
              name="notes"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={notesRef}
                  label="Notas (opcional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.notes?.message}
                  placeholder="Riega cada 3 días, necesita luz indirecta..."
                  multiline
                />
              )}
            />

            <AppButton
              title={isSaving ? "Guardando..." : "Guardar cambios"}
              onPress={onSubmit}
              disabled={isSaving || isOffline}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import { AppTheme } from "@/src/theme/designSystem";

function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.cardOverlay,
      justifyContent: "flex-end",
    },
    card: {
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
    headerRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    content: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    fieldBlock: {
      width: "100%",
      gap: spacing.xs,
    },
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
  });
}
