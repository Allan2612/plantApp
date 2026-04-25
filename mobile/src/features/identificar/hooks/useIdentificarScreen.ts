import { useAuthStore } from "@/src/store/auth.store";
import { createCatalogPlant } from "@/src/features/catalogo/services/catalogoApi.service";
import { createUserPlant } from "@/src/features/mis-plantas/services/misPlantasApi.service";
import {
  fetchPlantImageUrl,
  identifyPlantFromUri,
  PlantIdentificationResult,
} from "@/src/features/identificar/services/aiIdentification.service";
import { useCamera } from "@/src/features/identificar/hooks/useCamera";
import LocalObjectDetectionService, {
  DetectionResult,
} from "@/src/features/identificar/services/localObjectDetection.service";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { useToast } from "@/src/providers/ToastProvider";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";

export type PermissionStep = "camera" | "mediaLibrary" | "granted";

export function useIdentificarScreen() {
  const camera = useCamera({ requestOnMount: true });
  const { showToast } = useToast();
  const { isConnected } = useNetworkStatus();
  const profile = useAuthStore((state) => state.profile);
  const isOffline = isConnected === false;

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiResult, setAiResult] = useState<PlantIdentificationResult | null>(null);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pickedPhoto, setPickedPhoto] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [galleryThumbnailUri, setGalleryThumbnailUri] = useState<string | null>(null);

  // Single source of truth: camera photo takes priority over gallery pick
  const capturedPhoto = camera.lastPhoto ?? pickedPhoto;

  useEffect(() => {
    MediaLibrary.getAssetsAsync({ first: 1, mediaType: "photo", sortBy: [["creationTime", false]] })
      .then((result) => {
        const uri = result.assets[0]?.uri ?? null;
        setGalleryThumbnailUri(uri);
      })
      .catch(() => setGalleryThumbnailUri(null));
  }, []);

  const permissionStep: PermissionStep = !camera.isCameraPermissionGranted
    ? "camera"
    : !camera.isMediaLibraryPermissionGranted
      ? "mediaLibrary"
      : "granted";

  const openCamera = useCallback(() => {
    camera.clearError();
    setIsCameraOpen(true);
  }, [camera]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const runLocalDetection = useCallback(async (photoUri: string) => {
    setIsDetecting(true);
    setDetections([]);
    try {
      const results = await LocalObjectDetectionService.detectFromImageUri(photoUri);
      setDetections(results);
    } catch {
      setDetections([]);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const photo = await camera.takePhoto({ quality: 0.85 });
    if (!photo) return;
    setIsCameraOpen(false);
    setAiResult(null);
    await runLocalDetection(photo.uri);
  }, [camera, runLocalDetection]);

  const handlePickFromGallery = useCallback(async () => {
    // Close the camera modal first and wait for it to fully dismiss
    setIsCameraOpen(false);
    await new Promise<void>((resolve) => setTimeout(resolve, 350));

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    camera.clearLastPhoto();
    setPickedPhoto({ uri: asset.uri, width: asset.width, height: asset.height });
    setAiResult(null);
    setAiImageUrl(null);
    setDetections([]);
    await runLocalDetection(asset.uri);
  }, [camera, runLocalDetection]);

  const handleRetakePhoto = useCallback(() => {
    camera.clearLastPhoto();
    setPickedPhoto(null);
    setDetections([]);
    setDescription("");
    setAiResult(null);
    setAiImageUrl(null);
    setIsCameraOpen(true);
  }, [camera]);

  const handleClearPhoto = useCallback(() => {
    camera.clearLastPhoto();
    setPickedPhoto(null);
    setDetections([]);
    setDescription("");
    setAiResult(null);
    setAiImageUrl(null);
  }, [camera]);

  const handleIdentify = useCallback(async () => {
    if (!capturedPhoto || isIdentifying || isDetecting) return;

    setIsIdentifying(true);
    setAiResult(null);
    setAiImageUrl(null);

    try {
      const result = await identifyPlantFromUri(capturedPhoto.uri, description);
      setAiResult(result);

      if (result.isPlant) {
        fetchPlantImageUrl(result.scientificName, result.commonName).then(setAiImageUrl);
      } else {
        showToast("No se detectó una planta en la imagen. Intenta con una foto más clara.", "error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al analizar la imagen";
      showToast(message, "error");
    } finally {
      setIsIdentifying(false);
    }
  }, [capturedPhoto, description, isDetecting, isIdentifying, showToast]);

  const handleSavePlant = useCallback(async () => {
    if (!aiResult?.isPlant || !aiResult.commonName || isSaving) return;
    const backendUserId = profile?.user.id;
    if (!backendUserId) {
      showToast("Debes iniciar sesión para guardar plantas.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const catalogPlant = await createCatalogPlant({
        name: aiResult.commonName,
        scientificName: aiResult.scientificName ?? aiResult.commonName,
        description: aiResult.description ?? "",
        difficulty: aiResult.difficulty ?? "medium",
        isToxic: aiResult.isToxic ?? false,
        lightNotes: aiResult.lightNotes ?? undefined,
        generalCareNotes: aiResult.careSummary ?? undefined,
        imageUrl: aiImageUrl ?? undefined,
      });

      await createUserPlant({
        userId: backendUserId,
        plantCatalogId: catalogPlant.id,
        nickname: aiResult.commonName,
        notes: aiResult.careSummary ?? undefined,
      });

      showToast(`${aiResult.commonName} guardada en Mis Plantas`, "success");
      handleClearPhoto();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar la planta";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  }, [aiImageUrl, aiResult, profile?.user.id, handleClearPhoto, isSaving, showToast]);

  return {
    cameraRef: camera.cameraRef,
    facing: camera.facing,
    flashMode: camera.flashMode,
    isBusy: camera.isBusy,
    isLoadingPermissions: camera.isLoadingPermissions,
    cameraError: camera.error,

    permissionStep,
    isCameraPermissionGranted: camera.isCameraPermissionGranted,
    isMediaLibraryPermissionGranted: camera.isMediaLibraryPermissionGranted,
    canAskAgainCamera: camera.canAskAgainCamera,
    canAskAgainMediaLibrary: camera.canAskAgainMediaLibrary,
    requestCameraPermission: camera.requestPermissions,
    requestMediaLibraryPermission: camera.requestMediaLibraryPermission,
    openSettings: camera.openSettings,

    toggleFacing: camera.toggleFacing,
    toggleFlash: camera.toggleFlash,

    isCameraOpen,
    openCamera,
    closeCamera,

    capturedPhoto,
    galleryThumbnailUri,
    handleTakePhoto,
    handlePickFromGallery,
    handleRetakePhoto,
    handleClearPhoto,
    handleIdentify,
    handleSavePlant,

    detections,
    isDetecting,
    aiResult,
    aiImageUrl,
    isIdentifying,
    isSaving,

    description,
    setDescription,
    isOffline,
  };
}
