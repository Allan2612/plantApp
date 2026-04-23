import { CameraView, CameraType, FlashMode } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { RefObject } from "react";

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface VideoResult {
  uri: string;
}

export interface CaptureOptions {
  quality?: number;
  base64?: boolean;
  skipProcessing?: boolean;
}

export interface VideoCaptureOptions {
  maxDuration?: number;
  maxFileSize?: number;
}

const CameraService = {
  async takePhoto(
    cameraRef: RefObject<CameraView | null>,
    options: CaptureOptions = {}
  ): Promise<PhotoResult> {
    if (!cameraRef.current) {
      throw new Error("La camara no esta disponible");
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: options.quality ?? 0.8,
      base64: options.base64 ?? false,
      skipProcessing: options.skipProcessing ?? false,
    });

    if (!photo) {
      throw new Error("No se pudo capturar la foto");
    }

    return {
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      base64: photo.base64,
    };
  },

  async startRecording(
    cameraRef: RefObject<CameraView | null>,
    options: VideoCaptureOptions = {}
  ): Promise<VideoResult> {
    if (!cameraRef.current) {
      throw new Error("La camara no esta disponible");
    }

    const video = await cameraRef.current.recordAsync({
      maxDuration: options.maxDuration,
      maxFileSize: options.maxFileSize,
    });

    if (!video?.uri) {
      throw new Error("No se pudo grabar el video");
    }

    return { uri: video.uri };
  },

  stopRecording(cameraRef: RefObject<CameraView | null>): void {
    if (!cameraRef.current) return;
    cameraRef.current.stopRecording();
  },

  async saveToGallery(uri: string): Promise<MediaLibrary.Asset> {
    return MediaLibrary.createAssetAsync(uri);
  },

  toggleFacing(current: CameraType): CameraType {
    return current === "back" ? "front" : "back";
  },

  cycleFlashMode(current: FlashMode): FlashMode {
    const modes: FlashMode[] = ["off", "on", "auto"];
    const index = modes.indexOf(current);
    return modes[(index + 1) % modes.length];
  },
};

export default CameraService;
