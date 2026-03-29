import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import InputText from "@/src/components/shared/InputText/InputText";
import { useIdentificarScreen } from "@/src/features/identificar/hooks/useIdentificarScreen";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { CameraView } from "expo-camera";
import { Controller } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { createStyles } from "./styles";

export default function IdentificarScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const {
    cameraRef,
    nicknameRef,
    contextRef,
    permission,
    requestPermission,
    cameraError,
    setCameraError,
    isCameraVisible,
    setIsCameraVisible,
    isSavingDraft,
    draft,
    control,
    errors,
    photoPreview,
    onSaveDraft,
    handleTakePhoto,
    handleRetakePhoto,
    handleRemovePhoto,
  } = useIdentificarScreen();

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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <AppText variant="heading">Identificar planta</AppText>
            <AppText variant="body" style={styles.headerSubtitle}>
              Toma una foto y completa un formulario temporal. La consulta a IA
              se habilitara en una proxima etapa.
            </AppText>
          </View>

          <View style={styles.cameraCard}>
            <AppText variant="subheading">Foto de la planta</AppText>
            {!permission ? (
              <AppText variant="body" style={styles.infoText}>
                Verificando permisos de camara...
              </AppText>
            ) : null}

            {permission && !permission.granted ? (
              <View style={styles.permissionBlock}>
                <AppText variant="body" style={styles.infoText}>
                  Necesitamos permiso de camara para capturar la planta.
                </AppText>
                <AppButton
                  title="Permitir camara"
                  onPress={() => {
                    void requestPermission();
                  }}
                />
              </View>
            ) : null}

            {permission?.granted ? (
              <View style={styles.captureArea}>
                {isCameraVisible ? (
                  <CameraView
                    ref={cameraRef}
                    style={styles.cameraView}
                    facing="back"
                  />
                ) : photoPreview ? (
                  <Image
                    source={{ uri: photoPreview }}
                    style={styles.previewImage}
                  />
                ) : null}

                <View style={styles.captureActions}>
                  {isCameraVisible ? (
                    <>
                      <AppButton title="Capturar" onPress={handleTakePhoto} />
                      <AppButton
                        title="Cancelar"
                        variant="secondary"
                        onPress={() => {
                          setIsCameraVisible(false);
                        }}
                      />
                    </>
                  ) : photoPreview ? (
                    <>
                      <AppButton
                        title="Tomar otra foto"
                        variant="secondary"
                        onPress={handleRetakePhoto}
                      />
                      <AppButton
                        title="Quitar foto"
                        variant="secondary"
                        onPress={handleRemovePhoto}
                      />
                    </>
                  ) : (
                    <AppButton
                      title="Añadir foto"
                      onPress={() => {
                        setIsCameraVisible(true);
                        setCameraError(null);
                      }}
                    />
                  )}
                </View>
              </View>
            ) : null}

            {cameraError ? (
              <AppText variant="caption" style={styles.errorText}>
                {cameraError}
              </AppText>
            ) : null}

            {errors.photoUri?.message ? (
              <AppText variant="caption" style={styles.errorText}>
                {errors.photoUri.message}
              </AppText>
            ) : null}
          </View>

          <View style={styles.formCard}>
            <AppText variant="subheading">Formulario temporal</AppText>

            <Controller
              control={control}
              name="nickname"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={nicknameRef}
                  label="Nombre tentativo (opcional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.nickname?.message}
                  placeholder="Ejemplo: Monstera"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => contextRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}
            />

            <Controller
              control={control}
              name="context"
              render={({ field: { value, onChange } }) => (
                <InputText
                  ref={contextRef}
                  label="Contexto para la IA (opcional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.context?.message}
                  placeholder="Ejemplo: hoja con manchas marrones, interior sin sol directo"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={onSaveDraft}
                />
              )}
            />

            <AppButton
              title={
                isSavingDraft ? "Guardando..." : "Guardar formulario temporal"
              }
              onPress={onSaveDraft}
              disabled={isSavingDraft}
            />
          </View>

          {draft ? (
            <View style={styles.summaryCard}>
              <AppText variant="subheading">Borrador listo</AppText>
              <AppText variant="body" style={styles.summaryText}>
                Foto: capturada
              </AppText>
              <AppText variant="body" style={styles.summaryText}>
                Nombre tentativo: {draft.nickname ?? "No definido"}
              </AppText>
              <AppText variant="body" style={styles.summaryText}>
                Contexto: {draft.context ?? "No definido"}
              </AppText>
              <AppText variant="caption" style={styles.summaryDate}>
                Guardado temporal: {new Date(draft.createdAt).toLocaleString()}
              </AppText>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
