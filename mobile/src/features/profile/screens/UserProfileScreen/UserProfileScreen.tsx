import AppButton from "@/src/components/shared/AppButton/AppButton";
import EmptyState from "@/src/components/shared/EmptyState";
import InputText from "@/src/components/shared/InputText";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import SingleSelect from "@/src/components/shared/SingleSelect";
import {
  formatBirthDateForDisplay,
  getAvatarUri,
  mapVisibilityLabel,
  parseInputBirthDate,
  toIsoBirthDate,
  useUserProfileScreen,
  visibilityOptions,
} from "@/src/features/profile/hooks/useUserProfileScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { createStyles } from "./styles";

export default function UserProfileScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const {
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
  } = useUserProfileScreen();

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
