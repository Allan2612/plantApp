import { useCamera } from "@/src/features/identificar/hooks/useCamera";
import LocalObjectDetectionService, {
  DetectionResult,
} from "@/src/features/identificar/services/localObjectDetection.service";
import { useToast } from "@/src/providers/ToastProvider";
import { useCallback, useState } from "react";

export type PermissionStep = "camera" | "mediaLibrary" | "granted";

const PLANT_LABELS = ["potted plant", "plant", "flower", "tree", "broccoli", "vase"];

export function useIdentificarScreen() {
  const camera = useCamera({ requestOnMount: true });
  const { showToast } = useToast();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

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

  const runDetection = useCallback(async (photoUri: string) => {
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
    await runDetection(photo.uri);
  }, [camera, runDetection]);

  const handleRetakePhoto = useCallback(() => {
    camera.clearLastPhoto();
    setDetections([]);
    setDescription("");
    setIsCameraOpen(true);
  }, [camera]);

  const handleClearPhoto = useCallback(() => {
    camera.clearLastPhoto();
    setDetections([]);
    setDescription("");
  }, [camera]);

  const handleIdentify = useCallback(() => {
    if (isDetecting) return;

    const plantDetection = detections.find((d) =>
      PLANT_LABELS.some((label) => d.label.toLowerCase().includes(label))
    );

    if (plantDetection) {
      showToast(
        `Planta detectada localmente: ${plantDetection.label} (${Math.round(plantDetection.score * 100)}%). Enviando a IA...`,
        "success"
      );
    } else if (detections.length > 0) {
      showToast(
        "No se identifico una planta en la imagen. Intenta con una foto mas clara.",
        "error"
      );
    } else {
      showToast(
        "No se detecto ningun objeto. Asegurate de que la planta este bien iluminada.",
        "error"
      );
    }
  }, [detections, isDetecting, showToast]);

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
    requestCameraPermission: camera.requestPermissions,
    requestMediaLibraryPermission: camera.requestMediaLibraryPermission,

    toggleFacing: camera.toggleFacing,
    toggleFlash: camera.toggleFlash,

    isCameraOpen,
    openCamera,
    closeCamera,

    capturedPhoto: camera.lastPhoto,
    handleTakePhoto,
    handleRetakePhoto,
    handleClearPhoto,
    handleIdentify,

    detections,
    isDetecting,

    description,
    setDescription,
  };
}
