import AppButton from "@/src/components/shared/AppButton/AppButton";
import EmptyState from "@/src/components/shared/EmptyState";
import InputText from "@/src/components/shared/InputText";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import PressableCard from "@/src/components/shared/PressableCard/PressableCard";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import SingleSelect from "@/src/components/shared/SingleSelect";
import CatalogExplorerSelect from "@/src/features/mis-plantas/components/CatalogExplorerSelect";
import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { fetchCatalogPlants } from "@/src/features/catalogo/services/catalogoApi.service";
import {
  createUserPlant,
  fetchUserPlants,
  updateUserPlant,
  UserPlantListItem,
} from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import { useToast } from "@/src/providers/ToastProvider";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { z } from "zod";

import { createStyles } from "./styles";

const healthStatusOptions = ["good", "regular", "bad"] as const;
const healthLabels: Record<(typeof healthStatusOptions)[number], string> = {
  good: "Buena",
  regular: "Regular",
  bad: "Crítica",
};

const healthSelectOptions = healthStatusOptions.map((value) => ({
  value,
  label: healthLabels[value],
}));

const imagePathSchema = z
  .string()
  .trim()
  .min(1, "Agrega una imagen de tu planta.")
  .refine(
    (value) => /^(https?:\/\/|file:\/\/|data:image\/)/i.test(value),
    "Usa una URL válida (https://...) o una ruta file://.",
  );

const editPlantSchema = z.object({
  plantCatalogId: z.string().trim().min(1, "Selecciona una especie del catálogo."),
  nickname: z.string().trim().min(1, "El nombre de la planta es requerido."),
  customImageUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^(https?:\/\/|file:\/\/|data:image\/)/i.test(value),
      "Usa una URL válida (https://...) o una ruta file://.",
    ),
  healthStatus: z.enum(healthStatusOptions, { message: "Selecciona un estado de salud." }),
  locationHome: z.string().trim().optional(),
  acquiredDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Usa formato AAAA-MM-DD."),
  notes: z.string().trim().optional(),
});

const createPlantSchema = z.object({
  plantCatalogId: z.string().trim().min(1, "Selecciona una especie del catálogo."),
  nickname: z.string().trim().min(1, "Define un nombre para tu planta."),
  customImageUrl: imagePathSchema,
  healthStatus: z.enum(healthStatusOptions, { message: "Selecciona un estado de salud." }),
  locationHome: z.string().trim().optional(),
  acquiredDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Usa formato AAAA-MM-DD."),
  notes: z.string().trim().optional(),
  favorite: z.boolean(),
});

type EditPlantValues = z.infer<typeof editPlantSchema>;
type CreatePlantValues = z.infer<typeof createPlantSchema>;

function getStringField(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function getHealthStatus(source: Record<string, unknown>): EditPlantValues["healthStatus"] {
  const value = source.healthStatus;
  if (value === "good" || value === "regular" || value === "bad") return value;
  return "good";
}

function getUserPlantPayload(item: UserPlantListItem): Record<string, unknown> {
  if (item.userPlant && typeof item.userPlant === "object") {
    return item.userPlant as Record<string, unknown>;
  }
  return {};
}

function getUserPlantId(item: UserPlantListItem): string {
  return getStringField(getUserPlantPayload(item), "id");
}

function getCatalogPlantName(item: UserPlantListItem): string {
  if (!item.catalogPlant || typeof item.catalogPlant !== "object") {
    return "Especie sin catálogo";
  }
  const name = (item.catalogPlant as Record<string, unknown>).name;
  return typeof name === "string" && name.trim() ? name : "Especie sin catálogo";
}

function getCatalogPlantImage(item: UserPlantListItem): string {
  if (!item.catalogPlant || typeof item.catalogPlant !== "object") return "";
  const image = (item.catalogPlant as Record<string, unknown>).imageUrl;
  return typeof image === "string" ? image : "";
}

function resolvePlantImage(item: UserPlantListItem): string {
  const payload = getUserPlantPayload(item);
  const customImage = getStringField(payload, "customImageUrl");
  if (customImage.trim()) return customImage;
  return getCatalogPlantImage(item);
}

function isValidImageUri(uri: string): boolean {
  return /^(https?:\/\/|file:\/\/|data:image\/)/i.test(uri.trim());
}

function formatDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDateDisplay(value: string | null | undefined): string {
  const normalized = formatDateInput(value);
  if (!normalized) return "Seleccionar fecha";
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return "Seleccionar fecha";
  return `${day}/${month}/${year}`;
}

function parseInputDate(value: string | null | undefined): Date {
  const normalized = formatDateInput(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day);
}

function toIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MisPlantasScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { user } = useAuthSession();
  const { showToast } = useToast();

  const [backendUserId, setBackendUserId] = useState("");
  const [plants, setPlants] = useState<UserPlantListItem[]>([]);
  const [catalog, setCatalog] = useState<PlantCatalogItem[]>([]);
  const [editingPlantId, setEditingPlantId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [createDatePickerValue, setCreateDatePickerValue] = useState<Date>(new Date());
  const [editDatePickerValue, setEditDatePickerValue] = useState<Date>(new Date());
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    watch: watchEdit,
    formState: { errors: editErrors },
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

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    setValue: setCreateValue,
    watch: watchCreate,
    formState: { errors: createErrors },
  } = useForm<CreatePlantValues>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      plantCatalogId: "",
      nickname: "",
      customImageUrl: "",
      healthStatus: "good",
      locationHome: "",
      acquiredDate: "",
      notes: "",
      favorite: false,
    },
  });

  const selectedCatalogId = watchCreate("plantCatalogId");
  const selectedEditCatalogId = watchEdit("plantCatalogId");
  const selectedFavorite = watchCreate("favorite");
  const createImageInput = watchCreate("customImageUrl");
  const editImageInput = watchEdit("customImageUrl");

  const createNicknameRef = useRef<TextInput | null>(null);
  const createImageRef = useRef<TextInput | null>(null);
  const createLocationRef = useRef<TextInput | null>(null);
  const createNotesRef = useRef<TextInput | null>(null);

  const editNicknameRef = useRef<TextInput | null>(null);
  const editImageRef = useRef<TextInput | null>(null);
  const editLocationRef = useRef<TextInput | null>(null);
  const editNotesRef = useRef<TextInput | null>(null);

  const editingPlant = useMemo(() => {
    return plants.find((item) => getUserPlantId(item) === editingPlantId) ?? null;
  }, [editingPlantId, plants]);

  const createImagePreview = useMemo(() => {
    const candidate = (createImageInput ?? "").trim();
    return isValidImageUri(candidate) ? candidate : "";
  }, [createImageInput]);

  const editImagePreview = useMemo(() => {
    const candidate = (editImageInput ?? "").trim();
    return isValidImageUri(candidate) ? candidate : "";
  }, [editImageInput]);

  const hydrateEditForm = useCallback(
    (item: UserPlantListItem | null) => {
      if (!item) {
        resetEdit({
          plantCatalogId: "",
          nickname: "",
          customImageUrl: "",
          healthStatus: "good",
          locationHome: "",
          acquiredDate: "",
          notes: "",
        });
        return;
      }

      const payload = getUserPlantPayload(item);
      resetEdit({
        plantCatalogId: getStringField(payload, "plantCatalogId"),
        nickname: getStringField(payload, "nickname"),
        customImageUrl: getStringField(payload, "customImageUrl"),
        healthStatus: getHealthStatus(payload),
        locationHome: getStringField(payload, "locationHome"),
        acquiredDate: formatDateInput(getStringField(payload, "acquiredDate")),
        notes: getStringField(payload, "notes"),
      });
    },
    [resetEdit],
  );

  const resolveBackendUserId = useCallback(async () => {
    if (!user?.uid) return "";

    const resolution = await fetchProfileForSession({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      providerId: user.providerData?.[0]?.providerId ?? null,
    });

    return resolution?.backendUserId ?? "";
  }, [user?.displayName, user?.email, user?.providerData, user?.uid]);

  const loadAll = useCallback(async () => {
    if (!user?.uid) {
      setLoadError(null);
      setPlants([]);
      setCatalog([]);
      setBackendUserId("");
      setEditingPlantId("");
      hydrateEditForm(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const resolvedUserId = await resolveBackendUserId();
      if (!resolvedUserId) {
        throw new Error("No se pudo resolver el usuario en backend.");
      }

      setBackendUserId(resolvedUserId);

      const [plantsResponse, catalogItems] = await Promise.all([
        fetchUserPlants(resolvedUserId),
        fetchCatalogPlants(),
      ]);

      const nextPlants = plantsResponse.items ?? [];
      setPlants(nextPlants);
      setCatalog(catalogItems);

      if (!editingPlantId) return;

      const edited = nextPlants.find((item) => getUserPlantId(item) === editingPlantId) ?? null;
      hydrateEditForm(edited);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar tu jardín.";
      setLoadError(message);
      showToast(message, "error");
      setPlants([]);
      setCatalog([]);
      setEditingPlantId("");
      hydrateEditForm(null);
    } finally {
      setIsLoading(false);
    }
  }, [editingPlantId, hydrateEditForm, resolveBackendUserId, showToast, user?.uid]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  const closeEditModal = () => {
    setShowEditDatePicker(false);
    setEditingPlantId("");
    hydrateEditForm(null);
  };

  const closeCreateModal = () => {
    setShowCreateDatePicker(false);
    setShowCreateForm(false);
  };

  const onSaveEdit = handleEditSubmit(async (values) => {
    if (!editingPlant) {
      showToast("Selecciona una planta para editar.", "error");
      return;
    }

    const userPlantId = getUserPlantId(editingPlant);
    if (!userPlantId) {
      showToast("No se encontró el identificador de la planta.", "error");
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateUserPlant(userPlantId, {
        plantCatalogId: values.plantCatalogId,
        nickname: values.nickname,
        customImageUrl: values.customImageUrl || undefined,
        healthStatus: values.healthStatus,
        locationHome: values.locationHome || undefined,
        acquiredDate: values.acquiredDate || undefined,
        notes: values.notes || undefined,
      });
      showToast("Planta actualizada correctamente.", "success");
      closeEditModal();
      await loadAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la planta.";
      showToast(message, "error");
    } finally {
      setIsSavingEdit(false);
    }
  });

  const onCreatePlant = handleCreateSubmit(async (values) => {
    if (!backendUserId.trim()) {
      showToast("No se encontró tu usuario de backend para crear la planta.", "error");
      return;
    }

    setIsSavingCreate(true);
    try {
      await createUserPlant({
        userId: backendUserId,
        plantCatalogId: values.plantCatalogId,
        nickname: values.nickname,
        customImageUrl: values.customImageUrl,
        healthStatus: values.healthStatus,
        locationHome: values.locationHome || undefined,
        acquiredDate: values.acquiredDate || undefined,
        notes: values.notes || undefined,
        favorite: values.favorite,
      });

      showToast("Planta agregada a tu jardín.", "success");
      resetCreate({
        plantCatalogId: "",
        nickname: "",
        customImageUrl: "",
        healthStatus: "good",
        locationHome: "",
        acquiredDate: "",
        notes: "",
        favorite: false,
      });
      setShowCreateForm(false);
      await loadAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la planta.";
      showToast(message, "error");
    } finally {
      setIsSavingCreate(false);
    }
  });

  const healthyCount = plants.filter((item) => getHealthStatus(getUserPlantPayload(item)) === "good").length;

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
