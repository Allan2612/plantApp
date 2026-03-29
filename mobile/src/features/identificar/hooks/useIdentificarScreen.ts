import { useToast } from "@/src/providers/ToastProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { TextInput } from "react-native";
import { z } from "zod";

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

export function useIdentificarScreen() {
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

  return {
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
  };
}
