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
  isCameraPermissionGranted: boolean;
  isMediaLibraryPermissionGranted: boolean;
  isLoadingPermissions: boolean;
  facing: CameraType;
  flashMode: FlashMode;
  isRecording: boolean;
  isBusy: boolean;
  requestPermissions: () => Promise<void>;
  requestMediaLibraryPermission: () => Promise<void>;
  takePhoto: (options?: CaptureOptions) => Promise<PhotoResult | null>;
  startRecording: (options?: VideoCaptureOptions) => Promise<VideoResult | null>;
  stopRecording: () => void;
  toggleFacing: () => void;
  toggleFlash: () => void;
  saveToGallery: (uri: string) => Promise<void>;
  clearError: () => void;
  clearLastPhoto: () => void;
  clearLastVideo: () => void;
  lastPhoto: PhotoResult | null;
  lastVideo: VideoResult | null;
  error: string | null;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { requestOnMount = true } = options;

  const cameraRef = useRef<CameraView | null>(null);

  const [permissions, setPermissions] = useState<AppPermissions | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<PhotoResult | null>(null);
  const [lastVideo, setLastVideo] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCameraPermissionGranted =
    !!permissions && PermissionService.isGranted(permissions.camera);

  const isMediaLibraryPermissionGranted =
    !!permissions && PermissionService.isGranted(permissions.mediaLibrary);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLastPhoto = useCallback(() => {
    setLastPhoto(null);
  }, []);

  const clearLastVideo = useCallback(() => {
    setLastVideo(null);
  }, []);

  const requestPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    setError(null);

    try {
      const cameraStatus = await PermissionService.requestCameraPermission();

      setPermissions((current) => ({
        camera: cameraStatus,
        mediaLibrary: current?.mediaLibrary ?? "undetermined",
      }));
    } catch {
      setError("Error al solicitar permiso de camara");
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  const requestMediaLibraryPermission = useCallback(async () => {
    setIsLoadingPermissions(true);
    setError(null);

    try {
      const mediaLibraryStatus = await PermissionService.requestMediaLibraryPermission();

      setPermissions((current) => ({
        camera: current?.camera ?? "undetermined",
        mediaLibrary: mediaLibraryStatus,
      }));
    } catch {
      setError("Error al solicitar permiso de galeria");
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    if (!requestOnMount) return;

    let isMounted = true;

    const bootstrapPermissions = async () => {
      try {
        const result = await PermissionService.checkAllPermissions();

        if (!isMounted) return;
        setPermissions(result);
      } catch {
        if (!isMounted) return;
        setError("Error al consultar permisos");
      }
    };

    void bootstrapPermissions();

    return () => {
      isMounted = false;
    };
  }, [requestOnMount]);

  const ensureCameraPermission = useCallback(async () => {
    if (permissions && PermissionService.isGranted(permissions.camera)) {
      return true;
    }

    setIsLoadingPermissions(true);
    setError(null);

    try {
      const cameraStatus = await PermissionService.requestCameraPermission();

      setPermissions((current) => ({
        camera: cameraStatus,
        mediaLibrary: current?.mediaLibrary ?? "undetermined",
      }));

      return PermissionService.isGranted(cameraStatus);
    } catch {
      setError("Error al solicitar permiso de camara");
      return false;
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [permissions]);

  const takePhoto = useCallback(
    async (options: CaptureOptions = {}): Promise<PhotoResult | null> => {
      if (isBusy || isRecording) return null;

      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) {
        setError("Debes permitir la camara para tomar fotos");
        return null;
      }

      if (!cameraRef.current) {
        setError("La camara no esta disponible");
        return null;
      }

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
    },
    [ensureCameraPermission, isBusy, isRecording]
  );

  const startRecording = useCallback(
    async (options: VideoCaptureOptions = {}): Promise<VideoResult | null> => {
      if (isBusy || isRecording) return null;

      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) {
        setError("Debes permitir la camara para grabar video");
        return null;
      }

      if (!cameraRef.current) {
        setError("La camara no esta disponible");
        return null;
      }

      setIsBusy(true);
      setIsRecording(true);
      setError(null);

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
    [ensureCameraPermission, isBusy, isRecording]
  );

  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    try {
      CameraService.stopRecording(cameraRef);
    } catch {
      setError("No se pudo detener la grabacion");
    }
  }, [isRecording]);

  const toggleFacing = useCallback(() => {
    if (isBusy || isRecording) return;
    setFacing((prev) => CameraService.toggleFacing(prev));
  }, [isBusy, isRecording]);

  const toggleFlash = useCallback(() => {
    if (isBusy) return;
    setFlashMode((prev) => CameraService.cycleFlashMode(prev));
  }, [isBusy]);

  const saveToGallery = useCallback(
    async (uri: string) => {
      if (!uri?.trim()) {
        setError("No hay un archivo valido para guardar");
        return;
      }

      setError(null);

      try {
        let mediaPermissionGranted =
          permissions && PermissionService.isGranted(permissions.mediaLibrary);

        if (!mediaPermissionGranted) {
          const mediaStatus = await PermissionService.requestMediaLibraryPermission();

          setPermissions((current) => ({
            camera: current?.camera ?? "undetermined",
            mediaLibrary: mediaStatus,
          }));

          mediaPermissionGranted = PermissionService.isGranted(mediaStatus);
        }

        if (!mediaPermissionGranted) {
          throw new Error("Debes permitir galeria para guardar la captura");
        }

        await CameraService.saveToGallery(uri);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al guardar en galeria";
        setError(message);
      }
    },
    [permissions]
  );

  return {
    cameraRef,
    permissions,
    isCameraPermissionGranted,
    isMediaLibraryPermissionGranted,
    isLoadingPermissions,
    facing,
    flashMode,
    isRecording,
    isBusy,
    requestPermissions,
    requestMediaLibraryPermission,
    takePhoto,
    startRecording,
    stopRecording,
    toggleFacing,
    toggleFlash,
    saveToGallery,
    clearError,
    clearLastPhoto,
    clearLastVideo,
    lastPhoto,
    lastVideo,
    error,
  };
}