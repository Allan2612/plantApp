import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useAuthStore } from "@/src/store/auth.store";
import { usePlantsStore } from "@/src/store/plants.store";
import { fetchCatalogPlants } from "@/src/features/catalogo/services/catalogoApi.service";
import {
  createUserPlant,
  fetchUserPlants,
  updateUserPlant,
  UserPlantListItem,
} from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import { cacheGet, cacheSet } from "@/src/services/offlineCache";
import { uploadUserPlantImage } from "@/src/services/imageUpload.service";
import { useToast } from "@/src/providers/ToastProvider";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native";
import { z } from "zod";

const healthStatusOptions = ["good", "regular", "bad"] as const;
export const healthLabels: Record<
  (typeof healthStatusOptions)[number],
  string
> = {
  good: "Buena",
  regular: "Regular",
  bad: "Crítica",
};

export const healthSelectOptions = healthStatusOptions.map((value) => ({
  value,
  label: healthLabels[value],
}));

const imagePathSchema = z
  .string()
  .trim()
  .min(1, "Agrega una imagen de tu planta.")
  .refine(
    (value) => /^(https?:\/\/|file:\/\/|content:\/\/|data:image\/)/i.test(value),
    "Selecciona una imagen de la galería o toma una foto.",
  );

export const editPlantSchema = z.object({
  plantCatalogId: z
    .string()
    .trim()
    .min(1, "Selecciona una especie del catálogo."),
  nickname: z.string().trim().min(1, "El nombre de la planta es requerido."),
  customImageUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^(https?:\/\/|file:\/\/|content:\/\/|data:image\/)/i.test(value),
      "Selecciona una imagen de la galería o toma una foto.",
    ),
  healthStatus: z.enum(healthStatusOptions, {
    message: "Selecciona un estado de salud.",
  }),
  locationHome: z.string().trim().optional(),
  acquiredDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Usa formato AAAA-MM-DD.",
    ),
  notes: z.string().trim().optional(),
});

const createPlantSchema = z.object({
  plantCatalogId: z
    .string()
    .trim()
    .min(1, "Selecciona una especie del catálogo."),
  nickname: z.string().trim().min(1, "Define un nombre para tu planta."),
  customImageUrl: imagePathSchema,
  healthStatus: z.enum(healthStatusOptions, {
    message: "Selecciona un estado de salud.",
  }),
  locationHome: z.string().trim().optional(),
  acquiredDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Usa formato AAAA-MM-DD.",
    ),
  notes: z.string().trim().optional(),
  favorite: z.boolean(),
});

export type EditPlantValues = z.infer<typeof editPlantSchema>;
type CreatePlantValues = z.infer<typeof createPlantSchema>;

export function getStringField(
  source: Record<string, unknown>,
  key: string,
): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

export function getHealthStatus(
  source: Record<string, unknown>,
): EditPlantValues["healthStatus"] {
  const value = source.healthStatus;
  if (value === "good" || value === "regular" || value === "bad") return value;
  return "good";
}

export function getUserPlantPayload(
  item: UserPlantListItem,
): Record<string, unknown> {
  if (item.userPlant && typeof item.userPlant === "object") {
    return item.userPlant as Record<string, unknown>;
  }
  return {};
}

export function getUserPlantId(item: UserPlantListItem): string {
  return getStringField(getUserPlantPayload(item), "id");
}

export function getCatalogPlantName(item: UserPlantListItem): string {
  if (!item.catalogPlant || typeof item.catalogPlant !== "object") {
    return "Especie sin catálogo";
  }
  const name = (item.catalogPlant as Record<string, unknown>).name;
  return typeof name === "string" && name.trim()
    ? name
    : "Especie sin catálogo";
}

export function getCatalogPlantImage(item: UserPlantListItem): string {
  if (!item.catalogPlant || typeof item.catalogPlant !== "object") return "";
  const image = (item.catalogPlant as Record<string, unknown>).imageUrl;
  return typeof image === "string" ? image : "";
}

export function resolvePlantImage(item: UserPlantListItem): string {
  const payload = getUserPlantPayload(item);
  const customImage = getStringField(payload, "customImageUrl");
  if (customImage.trim()) return customImage;
  return getCatalogPlantImage(item);
}

export function formatDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function formatDateDisplay(value: string | null | undefined): string {
  const normalized = formatDateInput(value);
  if (!normalized) return "Seleccionar fecha";
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return "Seleccionar fecha";
  return `${day}/${month}/${year}`;
}

export function parseInputDate(value: string | null | undefined): Date {
  const normalized = formatDateInput(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day);
}

export function toIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useMisPlantasScreen() {
  const { user } = useAuthSession();
  const cachedProfile = useAuthStore((state) => state.profile);
  const { showToast } = useToast();

  const [backendUserId, setBackendUserId] = useState("");
  const [plants, setPlants] = useState<UserPlantListItem[]>([]);
  const [catalog, setCatalog] = useState<PlantCatalogItem[]>([]);
  const [editingPlantId, setEditingPlantId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [createDatePickerValue, setCreateDatePickerValue] = useState<Date>(
    new Date(),
  );
  const [editDatePickerValue, setEditDatePickerValue] = useState<Date>(
    new Date(),
  );
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

  const createNicknameRef = useRef<TextInput | null>(null);
  const createLocationRef = useRef<TextInput | null>(null);
  const createNotesRef = useRef<TextInput | null>(null);

  const editNicknameRef = useRef<TextInput | null>(null);
  const editLocationRef = useRef<TextInput | null>(null);
  const editNotesRef = useRef<TextInput | null>(null);

  const editingPlant = useMemo(() => {
    return (
      plants.find((item) => getUserPlantId(item) === editingPlantId) ?? null
    );
  }, [editingPlantId, plants]);

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
        customImageUrl: resolvePlantImage(item),
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

    // Use cached profile first (works offline)
    if (cachedProfile?.user?.id) return cachedProfile.user.id;

    const resolution = await fetchProfileForSession({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      providerId: user.providerData?.[0]?.providerId ?? null,
    });

    return resolution?.backendUserId ?? "";
  }, [cachedProfile?.user?.id, user?.displayName, user?.email, user?.providerData, user?.uid]);

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

      const plantsKey = `plantica:plants:${resolvedUserId}`;
      const catalogKey = "plantica:catalog";

      const [cachedPlants, cachedCatalog] = await Promise.all([
        cacheGet<UserPlantListItem[]>(plantsKey),
        cacheGet<PlantCatalogItem[]>(catalogKey),
      ]);

      if (cachedPlants?.length) setPlants(cachedPlants);
      if (cachedCatalog?.length) setCatalog(cachedCatalog);
      if (cachedPlants?.length || cachedCatalog?.length) setIsLoading(false);

      const [plantsResponse, catalogItems] = await Promise.all([
        fetchUserPlants(resolvedUserId),
        fetchCatalogPlants(),
      ]);

      const nextPlants = plantsResponse.items ?? [];
      setPlants(nextPlants);
      usePlantsStore.getState().setPlants(nextPlants);
      setCatalog(catalogItems);
      void cacheSet(plantsKey, nextPlants);
      void cacheSet(catalogKey, catalogItems);

      if (!editingPlantId) return;

      const edited =
        nextPlants.find((item) => getUserPlantId(item) === editingPlantId) ??
        null;
      hydrateEditForm(edited);
    } catch {
      setLoadError("Sin conexión — mostrando datos guardados.");
    } finally {
      setIsLoading(false);
    }
  }, [
    editingPlantId,
    hydrateEditForm,
    resolveBackendUserId,
    user?.uid,
  ]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const refresh = loadAll;

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
      let imageUrl = values.customImageUrl || undefined;
      if (imageUrl) {
        imageUrl = await uploadUserPlantImage(userPlantId, imageUrl);
      }
      await updateUserPlant(userPlantId, {
        plantCatalogId: values.plantCatalogId,
        nickname: values.nickname,
        customImageUrl: imageUrl,
        healthStatus: values.healthStatus,
        locationHome: values.locationHome || undefined,
        acquiredDate: values.acquiredDate || undefined,
        notes: values.notes || undefined,
      });
      showToast("Planta actualizada correctamente.", "success");
      closeEditModal();
      await loadAll();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la planta.";
      showToast(message, "error");
    } finally {
      setIsSavingEdit(false);
    }
  });

  const onCreatePlant = handleCreateSubmit(async (values) => {
    if (!backendUserId.trim()) {
      showToast(
        "No se encontró tu usuario de backend para crear la planta.",
        "error",
      );
      return;
    }

    setIsSavingCreate(true);
    try {
      const created = await createUserPlant({
        userId: backendUserId,
        plantCatalogId: values.plantCatalogId,
        nickname: values.nickname,
        customImageUrl: undefined,
        healthStatus: values.healthStatus,
        locationHome: values.locationHome || undefined,
        acquiredDate: values.acquiredDate || undefined,
        notes: values.notes || undefined,
        favorite: values.favorite,
      });

      const newPlantId = typeof (created as Record<string, unknown>).id === "string"
        ? (created as Record<string, unknown>).id as string
        : "";
      if (newPlantId && values.customImageUrl) {
        await uploadUserPlantImage(newPlantId, values.customImageUrl).catch(() => {});
      }

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
      const message =
        error instanceof Error ? error.message : "No se pudo crear la planta.";
      showToast(message, "error");
    } finally {
      setIsSavingCreate(false);
    }
  });

  return {
    plants,
    catalog,
    editingPlantId,
    setEditingPlantId,
    isLoading,
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
    closeEditModal,
    closeCreateModal,
    onSaveEdit,
    onCreatePlant,
  };
}
