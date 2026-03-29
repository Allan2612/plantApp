import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import {
  fetchProfileForSession,
  fetchUserProfile,
  updateUserProfile,
} from "@/src/features/profile/services/profileApi.service";
import { useToast } from "@/src/providers/ToastProvider";
import { useAuthStore } from "@/src/store/auth.store";
import { BackendUser, UserVisibility } from "@/src/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const visibilityOptions: {
  value: UserVisibility;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "public", label: "Público", icon: "earth-outline" },
  { value: "private", label: "Privado", icon: "lock-closed-outline" },
  { value: "friends", label: "Amigos", icon: "people-outline" },
];

const visibilityValues = visibilityOptions.map((option) => option.value) as [
  UserVisibility,
  ...UserVisibility[],
];

const userFormSchema = z.object({
  displayName: z.string().trim().min(1, "El nombre visible es requerido."),
  firstName: z.string().trim().min(1, "El nombre es requerido."),
  lastName: z.string().trim().min(1, "El apellido es requerido."),
  username: z.string().trim().min(1, "El nombre de usuario es requerido."),
  avatarId: z.string().trim().min(1, "El avatar es requerido."),
  headline: z.string().trim().optional(),
  visibility: z.enum(visibilityValues, {
    message: "Selecciona una visibilidad.",
  }),
  birthDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "La fecha debe usar formato AAAA-MM-DD.",
    ),
  city: z.string().trim().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

function getStringField(
  source: Record<string, unknown> | BackendUser,
  key: string,
): string {
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function getVisibilityField(
  source: Record<string, unknown> | BackendUser,
): UserFormValues["visibility"] {
  const value = (source as Record<string, unknown>).visibility;
  if (value === "public" || value === "private" || value === "friends") {
    return value;
  }
  return visibilityOptions[0].value;
}

export function formatBirthDateForInput(
  value: string | null | undefined,
): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function formatBirthDateForDisplay(
  value: string | null | undefined,
): string {
  const normalized = formatBirthDateForInput(value);
  if (!normalized) return "Seleccionar fecha";
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return "Seleccionar fecha";
  return `${day}/${month}/${year}`;
}

export function parseInputBirthDate(value: string | null | undefined): Date {
  const normalized = formatBirthDateForInput(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day);
}

export function toIsoBirthDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mapVisibilityLabel(value: UserVisibility | undefined): string {
  return (
    visibilityOptions.find((option) => option.value === value)?.label ??
    "No definido"
  );
}

export function getAvatarUri(avatarId?: string | null): string | null {
  if (!avatarId?.trim()) return null;
  const normalized = avatarId.trim();
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return null;
}

function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /404|no se encontro|not found/i.test(error.message);
}

export function useUserProfileScreen() {
  const { user } = useAuthSession();
  const setGlobalProfile = useAuthStore((state) => state.setProfile);
  const { showToast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [backendUserId, setBackendUserId] = useState<string>("");
  const [profileUser, setProfileUser] = useState<BackendUser | null>(null);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [birthDatePickerValue, setBirthDatePickerValue] = useState<Date>(
    new Date(),
  );

  const resolveSessionProfile = useCallback(async () => {
    if (!user?.uid) return null;

    return fetchProfileForSession({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      providerId: user.providerData?.[0]?.providerId ?? null,
    });
  }, [user?.displayName, user?.email, user?.providerData, user?.uid]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      displayName: "",
      firstName: "",
      lastName: "",
      username: "",
      avatarId: "",
      headline: "",
      visibility: visibilityOptions[0].value,
      birthDate: "",
      city: "",
    },
  });

  useEffect(() => {
    if (!user?.uid) {
      setIsLoadingProfile(false);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      const resolution = await resolveSessionProfile();
      const profile = resolution?.profile ?? null;

      if (!isMounted) return;

      if (!profile?.user) {
        setIsLoadingProfile(false);
        showToast("No se pudo cargar el perfil del usuario.", "error");
        return;
      }

      const userPayload: BackendUser = profile.user;

      setBackendUserId(
        resolution?.backendUserId ?? getStringField(userPayload, "id"),
      );
      setProfileUser(profile.user);
      setGlobalProfile(profile);

      reset({
        displayName: getStringField(userPayload, "displayName"),
        firstName: getStringField(userPayload, "firstName"),
        lastName: getStringField(userPayload, "lastName"),
        username: getStringField(userPayload, "username"),
        avatarId: getStringField(userPayload, "avatarId"),
        headline: getStringField(userPayload, "headline"),
        visibility: getVisibilityField(userPayload),
        birthDate: formatBirthDateForInput(
          getStringField(userPayload, "birthDate"),
        ),
        city: getStringField(userPayload, "city"),
      });

      setIsLoadingProfile(false);
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reset, resolveSessionProfile, setGlobalProfile, showToast, user?.uid]);

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      let targetUserId = backendUserId.trim();
      if (!targetUserId) {
        const resolution = await resolveSessionProfile();
        targetUserId = resolution?.backendUserId?.trim() ?? "";
      }

      if (!targetUserId) {
        throw new Error(
          "No se encontro el identificador del usuario en backend.",
        );
      }

      try {
        await updateUserProfile(targetUserId, values);
      } catch (firstError) {
        if (!isNotFoundError(firstError)) throw firstError;

        const resolved = await resolveSessionProfile();
        const recoveredUserId = resolved?.backendUserId?.trim() ?? "";
        if (!recoveredUserId || recoveredUserId === targetUserId) {
          throw firstError;
        }

        await updateUserProfile(recoveredUserId, values);
        targetUserId = recoveredUserId;
      }

      setBackendUserId(targetUserId);

      const refreshedProfile = await fetchUserProfile(targetUserId);
      if (refreshedProfile?.user) {
        setProfileUser(refreshedProfile.user);
        setGlobalProfile(refreshedProfile);
      }

      showToast("Perfil actualizado correctamente.", "success");
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  });

  return {
    isLoadingProfile,
    isSaving,
    isEditing,
    setIsEditing,
    profileUser,
    showBirthDatePicker,
    setShowBirthDatePicker,
    birthDatePickerValue,
    setBirthDatePickerValue,
    control,
    errors,
    onSubmit,
  };
}
