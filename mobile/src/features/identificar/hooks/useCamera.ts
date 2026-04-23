import CameraService, {
  CaptureOptions,
  PhotoResult,
  VideoCaptureOptions,
  VideoResult,
} from "@/src/services/cameraService";
import PermissionService, { AppPermissions } from "@/src/services/permissionService";
import { CameraType, CameraView, FlashMode } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseCameraOptions {
  requestOnMount?: boolean;
}

interface UseCameraReturn {
  cameraRef: React.RefObject<CameraView | null>;
  permissions: AppPermissions | null;
  isPermissionGranted: boolean;
  isLoadingPermissions: boolean;
  facing: CameraType;
  flashMode: FlashMode;
  isRecording: boolean;
  isBusy: boolean;
  requestPermissions: () => Promise<void>;
  takePhoto: (options?: CaptureOptions) => Promise<PhotoResult | null>;
  startRecording: (options?: VideoCaptureOptions) => Promise<VideoResult | null>;
  stopRecording: () => void;
  toggleFacing: () => void;
  toggleFlash: () => void;
  saveToGallery: (uri: string) => Promise<void>;
  lastPhoto: PhotoResult | null;
  lastVideo: VideoResult | null;
  error: string | null;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { requestOnMount = true } = options;

  const cameraRef = useRef<CameraView>(null);

  const [permissions, setPermissions] = useState<AppPermissions | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<PhotoResult | null>(null);
  const [lastVideo, setLastVideo] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPermissionGranted =
    !!permissions &&
    PermissionService.isGranted(permissions.camera) &&
    PermissionService.isGranted(permissions.mediaLibrary);

  const requestPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    setError(null);

    try {
      const result = await PermissionService.requestAllPermissions();
      setPermissions(result);
    } catch {
      setError("Error al solicitar permisos");
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    if (!requestOnMount) return;
    requestPermissions();
  }, [requestOnMount, requestPermissions]);

  const takePhoto = useCallback(async (options: CaptureOptions = {}): Promise<PhotoResult | null> => {
    setIsBusy(true);
    setError(null);

    try {
      const photo = await CameraService.takePhoto(cameraRef, options);
      setLastPhoto(photo);
      return photo;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al capturar foto";
      setError(message);
      return null;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const startRecording = useCallback(
    async (options: VideoCaptureOptions = {}): Promise<VideoResult | null> => {
      setIsBusy(true);
      setError(null);
      setIsRecording(true);

      try {
        const video = await CameraService.startRecording(cameraRef, options);
        setLastVideo(video);
        return video;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al grabar video";
        setError(message);
        return null;
      } finally {
        setIsRecording(false);
        setIsBusy(false);
      }
    },
    []
  );

  const stopRecording = useCallback(() => {
    CameraService.stopRecording(cameraRef);
  }, []);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => CameraService.toggleFacing(prev));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlashMode((prev) => CameraService.cycleFlashMode(prev));
  }, []);

  const saveToGallery = useCallback(async (uri: string) => {
    setError(null);
    try {
      await CameraService.saveToGallery(uri);
    } catch {
      setError("Error al guardar en galeria");
    }
  }, []);

  return {
    cameraRef,
    permissions,
    isPermissionGranted,
    isLoadingPermissions,
    facing,
    flashMode,
    isRecording,
    isBusy,
    requestPermissions,
    takePhoto,
    startRecording,
    stopRecording,
    toggleFacing,
    toggleFlash,
    saveToGallery,
    lastPhoto,
    lastVideo,
    error,
  };
}
