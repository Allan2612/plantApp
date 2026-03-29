import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import InputText from "@/src/components/shared/InputText/InputText";
import { useToast } from "@/src/providers/ToastProvider";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

import { createStyles } from "./styles";

const identifyFormSchema = z.object({
  photoUri: z
    .string()
    .trim()
    .min(1, "Toma una foto para continuar con el formulario.")
    .refine(
      (value) => /^(file:\/\/|content:\/\/|https?:\/\/|data:image\/)/i.test(value),
      "La ruta de la foto no es valida. Intenta capturar nuevamente.",
    ),
  nickname: z.string().trim().max(60, "Usa un maximo de 60 caracteres.").optional(),
  context: z.string().trim().max(500, "Usa un maximo de 500 caracteres.").optional(),
});

type IdentifyFormValues = z.infer<typeof identifyFormSchema>;

interface IdentifyDraftForm {
  photoUri: string;
  nickname: string | null;
  context: string | null;
  createdAt: string;
}

export default function IdentificarScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { showToast } = useToast();
  const cameraRef = useRef<CameraView | null>(null);
  const nicknameRef = useRef<TextInput | null>(null);
  const contextRef = useRef<TextInput | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draft, setDraft] = useState<IdentifyDraftForm | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<IdentifyFormValues>({
    resolver: zodResolver(identifyFormSchema),
    defaultValues: {
      photoUri: "",
      nickname: "",
      context: "",
    },
  });

  const photoUri = watch("photoUri");
  const photoPreview = useMemo(() => {
    const candidate = (photoUri ?? "").trim();
    return candidate || null;
  }, [photoUri]);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (picture?.uri) {
        setValue("photoUri", picture.uri, { shouldValidate: true });
        clearErrors("photoUri");
        setCameraError(null);
        setIsCameraVisible(false);
      }
    } catch {
      setCameraError("No se pudo tomar la foto. Intenta nuevamente.");
      showToast("No se pudo tomar la foto. Intenta nuevamente.", "error");
    }
  };

  const handleRetakePhoto = () => {
    setValue("photoUri", "", { shouldValidate: false });
    setIsCameraVisible(true);
    setCameraError(null);
  };

  const handleRemovePhoto = () => {
    setValue("photoUri", "", { shouldValidate: true });
    setIsCameraVisible(false);
    setCameraError(null);
  };

  const onSaveDraft = handleSubmit(async (values) => {
    setIsSavingDraft(true);
    try {
      const parsed = identifyFormSchema.parse(values);

      setDraft({
        photoUri: parsed.photoUri,
        nickname: parsed.nickname?.trim() ? parsed.nickname.trim() : null,
        context: parsed.context?.trim() ? parsed.context.trim() : null,
        createdAt: new Date().toISOString(),
      });

      showToast("Formulario temporal guardado.", "success");
    } finally {
      setIsSavingDraft(false);
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <AppText variant="heading">Identificar planta</AppText>
          <AppText variant="body" style={styles.headerSubtitle}>
            Toma una foto y completa un formulario temporal. La consulta a IA se
            habilitara en una proxima etapa.
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
                <CameraView ref={cameraRef} style={styles.cameraView} facing="back" />
              ) : (
                photoPreview ? (
                  <Image source={{ uri: photoPreview }} style={styles.previewImage} />
                ) : null
              )}

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
                    <AppButton title="Tomar otra foto" variant="secondary" onPress={handleRetakePhoto} />
                    <AppButton title="Quitar foto" variant="secondary" onPress={handleRemovePhoto} />
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
            title={isSavingDraft ? "Guardando..." : "Guardar formulario temporal"}
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
