import AppButton from "@/src/components/shared/AppButton/AppButton";
import EmptyState from "@/src/components/shared/EmptyState";
import InputText from "@/src/components/shared/InputText";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import SingleSelect from "@/src/components/shared/SingleSelect";
import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import {
  fetchProfileForSession,
  fetchUserProfile,
  updateUserProfile,
} from "@/src/features/profile/services/profileApi.service";
import { useToast } from "@/src/providers/ToastProvider";
import { useAuthStore } from "@/src/store/auth.store";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { BackendUser, UserVisibility } from "@/src/types/auth.types";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { z } from "zod";
import { createStyles } from "./styles";

const visibilityOptions: {
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
  visibility: z.enum(visibilityValues, { message: "Selecciona una visibilidad." }),
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

type UserFormValues = z.infer<typeof userFormSchema>;

function getStringField(source: Record<string, unknown> | BackendUser, key: string): string {
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function getVisibilityField(source: Record<string, unknown> | BackendUser): UserFormValues["visibility"] {
  const value = (source as Record<string, unknown>).visibility;
  if (value === "public" || value === "private" || value === "friends") {
    return value;
  }
  return visibilityOptions[0].value;
}

function formatBirthDateForInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatBirthDateForDisplay(value: string | null | undefined): string {
  const normalized = formatBirthDateForInput(value);
  if (!normalized) return "Seleccionar fecha";
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return "Seleccionar fecha";
  return `${day}/${month}/${year}`;
}

function parseInputBirthDate(value: string | null | undefined): Date {
  const normalized = formatBirthDateForInput(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day);
}

function toIsoBirthDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapVisibilityLabel(value: UserVisibility | undefined): string {
  return visibilityOptions.find((option) => option.value === value)?.label ?? "No definido";
}

function getAvatarUri(avatarId?: string | null): string | null {
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

export default function UserProfileScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { user } = useAuthSession();
  const setGlobalProfile = useAuthStore((state) => state.setProfile);
  const { showToast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [backendUserId, setBackendUserId] = useState<string>("");
  const [profileUser, setProfileUser] = useState<BackendUser | null>(null);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [birthDatePickerValue, setBirthDatePickerValue] = useState<Date>(new Date());

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

      setBackendUserId(resolution?.backendUserId ?? getStringField(userPayload, "id"));
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
        birthDate: formatBirthDateForInput(getStringField(userPayload, "birthDate")),
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
        throw new Error("No se encontro el identificador del usuario en backend.");
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
      const message = error instanceof Error ? error.message : "No se pudo actualizar el perfil.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIdentity}>
            <View style={styles.headerAvatarBox}>
              {getAvatarUri(profileUser?.avatarId) ? (
                <Image source={{ uri: getAvatarUri(profileUser?.avatarId) ?? "" }} style={styles.headerAvatarImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={theme.spacing.lg + theme.spacing.md} color={theme.colors.primary} />
              )}
            </View>
            <View style={styles.titleBlock}>
              <AppText variant="heading">Mi perfil</AppText>
              <AppText variant="caption" style={styles.subtitle}>
                Consulta tu información y gestiona tus datos de perfil.
              </AppText>
            </View>
          </View>
          {isLoadingProfile ? null : (
            <AppButton
              title={isEditing ? "Cancelar" : "Editar perfil"}
              onPress={() => setIsEditing((current) => !current)}
              variant="secondary"
            />
          )}
        </View>

        {isLoadingProfile ? (
          <LoadingState message="Cargando datos del perfil..." />
        ) : !profileUser ? (
          <EmptyState message="No hay datos de perfil para mostrar." />
        ) : !isEditing ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHero}>
              <View style={styles.avatarBox}>
                {getAvatarUri(profileUser.avatarId) ? (
                  <Image
                    source={{ uri: getAvatarUri(profileUser.avatarId) ?? "" }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person-circle-outline" size={theme.spacing.xxl} color={theme.colors.primary} />
                )}
              </View>

              <View style={styles.summaryTopRow}>
                <AppText variant="subheading">{profileUser.displayName}</AppText>
                <AppText variant="caption" style={styles.userHandle}>
                  @{profileUser.username}
                </AppText>
                <AppText variant="caption" style={styles.emailText}>
                  {profileUser.email}
                </AppText>
              </View>
            </View>

            <AppText variant="body" style={styles.headlineText}>
              {profileUser.headline?.trim() ? profileUser.headline : "Sin descripcion."}
            </AppText>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <AppText variant="caption" style={styles.infoLabel}>
                  Nombre
                </AppText>
                <AppText variant="body">{profileUser.firstName}</AppText>
              </View>
              <View style={styles.infoItem}>
                <AppText variant="caption" style={styles.infoLabel}>
                  Apellido
                </AppText>
                <AppText variant="body">{profileUser.lastName}</AppText>
              </View>
              <View style={styles.infoItem}>
                <AppText variant="caption" style={styles.infoLabel}>
                  Ciudad
                </AppText>
                <AppText variant="body">{profileUser.city?.trim() ? profileUser.city : "No definida"}</AppText>
              </View>
              <View style={styles.infoItem}>
                <AppText variant="caption" style={styles.infoLabel}>
                  Visibilidad
                </AppText>
                <AppText variant="body">{mapVisibilityLabel(profileUser.visibility)}</AppText>
              </View>
              <View style={styles.infoItem}>
                <AppText variant="caption" style={styles.infoLabel}>
                  Fecha de nacimiento
                </AppText>
                <AppText variant="body">
                  {formatBirthDateForDisplay(profileUser.birthDate) || "No definida"}
                </AppText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Nombre visible"
                  value={value}
                  onChangeText={onChange}
                  error={errors.displayName?.message}
                  placeholder="Como quieres que se muestre tu perfil"
                />
              )}
            />

            <Controller
              control={control}
              name="firstName"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Nombre"
                  value={value}
                  onChangeText={onChange}
                  error={errors.firstName?.message}
                  placeholder="Tu nombre"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Apellido"
                  value={value}
                  onChangeText={onChange}
                  error={errors.lastName?.message}
                  placeholder="Tu apellido"
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Nombre de usuario"
                  value={value}
                  onChangeText={onChange}
                  error={errors.username?.message}
                  placeholder="Tu nombre de usuario"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="avatarId"
              render={({ field: { value, onChange } }) => (
                <View style={styles.fieldBlock}>
                  <InputText
                    label="Foto de perfil"
                    value={value}
                    onChangeText={onChange}
                    error={errors.avatarId?.message}
                    placeholder="Pega una URL de imagen o un id de avatar"
                    autoCapitalize="none"
                    helperText="Puedes usar una URL (https://...) o un avatar id interno."
                  />

                  {getAvatarUri(value) ? (
                    <View style={styles.previewRow}>
                      <Image source={{ uri: getAvatarUri(value) ?? "" }} style={styles.previewAvatar} />
                      <AppText variant="caption" style={styles.previewText}>
                        Vista previa de tu foto.
                      </AppText>
                    </View>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="headline"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Descripción"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.headline?.message}
                  placeholder="Cuéntanos algo sobre ti"
                  multiline
                />
              )}
            />

            <Controller
              control={control}
              name="visibility"
              render={({ field: { value, onChange } }) => (
                <View style={styles.fieldBlock}>
                  <AppText variant="label" style={styles.fieldLabel}>
                    Visibilidad
                  </AppText>
                  <SingleSelect
                    options={visibilityOptions}
                    value={value}
                    onChange={onChange}
                    renderIcon={(option, selected) => (
                      <Ionicons
                        name={option.icon}
                        size={theme.spacing.md + theme.spacing.xs}
                        color={selected ? theme.colors.primary : theme.colors.textSecondary}
                      />
                    )}
                  />
                  {errors.visibility?.message ? (
                    <AppText variant="caption" style={styles.errorText}>
                      {errors.visibility.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="birthDate"
              render={({ field: { value, onChange } }) => (
                <View style={styles.fieldBlock}>
                  <AppText variant="label" style={styles.fieldLabel}>
                    Fecha de nacimiento
                  </AppText>

                  <Pressable
                    onPress={() => {
                      const initialDate = parseInputBirthDate(value);
                      setBirthDatePickerValue(initialDate);
                      setShowBirthDatePicker(true);
                    }}
                    style={styles.dateSelector}
                  >
                    <AppText variant="body" style={styles.dateSelectorText}>
                      {formatBirthDateForDisplay(value)}
                    </AppText>
                    <Ionicons
                      name="calendar-clear-outline"
                      size={theme.spacing.md + theme.spacing.xs}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>

                  {showBirthDatePicker ? (
                    <DateTimePicker
                      value={birthDatePickerValue}
                      mode="date"
                      maximumDate={new Date()}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                        if (event.type === "dismissed") {
                          setShowBirthDatePicker(false);
                          return;
                        }

                        const nextDate = selectedDate ?? birthDatePickerValue;
                        setBirthDatePickerValue(nextDate);
                        onChange(toIsoBirthDate(nextDate));
                        setShowBirthDatePicker(false);
                      }}
                    />
                  ) : null}

                  {value ? (
                    <Pressable onPress={() => onChange("")} style={styles.clearDateAction}>
                      <AppText variant="caption" style={styles.clearDateText}>
                        Quitar fecha
                      </AppText>
                    </Pressable>
                  ) : null}

                  {errors.birthDate?.message ? (
                    <AppText variant="caption" style={styles.errorText}>
                      {errors.birthDate.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field: { value, onChange } }) => (
                <InputText
                  label="Ciudad"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.city?.message}
                  placeholder="Ciudad"
                />
              )}
            />

            <AppButton
              title={isSaving ? "Guardando..." : "Guardar perfil"}
              onPress={onSubmit}
              disabled={isSaving}
            />
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
