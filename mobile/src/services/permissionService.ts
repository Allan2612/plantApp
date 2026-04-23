import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Linking } from "react-native";

export type PermissionStatus = "granted" | "denied" | "undetermined";

export interface AppPermissions {
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
}

export interface PermissionDetails {
  status: PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
}

export interface AppPermissionDetails {
  camera: PermissionDetails;
  mediaLibrary: PermissionDetails;
}

const normalizeStatus = (granted: boolean, status: string): PermissionStatus => {
  if (granted) return "granted";
  if (status === "undetermined") return "undetermined";
  return "denied";
};

const PermissionService = {
  async requestCameraPermission(): Promise<PermissionStatus> {
    const { granted, status } = await Camera.requestCameraPermissionsAsync();
    return normalizeStatus(granted, status);
  },

  async requestMediaLibraryPermission(): Promise<PermissionStatus> {
    const { granted, status } = await MediaLibrary.requestPermissionsAsync();
    return normalizeStatus(granted, status);
  },

  async checkAllPermissions(): Promise<AppPermissions> {
    const [camera, mediaLibrary] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      MediaLibrary.getPermissionsAsync(),
    ]);

    return {
      camera: normalizeStatus(camera.granted, camera.status),
      mediaLibrary: normalizeStatus(mediaLibrary.granted, mediaLibrary.status),
    };
  },

  async checkAllPermissionDetails(): Promise<AppPermissionDetails> {
    const [camera, mediaLibrary] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      MediaLibrary.getPermissionsAsync(),
    ]);

    return {
      camera: {
        status: normalizeStatus(camera.granted, camera.status),
        granted: camera.granted,
        canAskAgain: camera.canAskAgain,
      },
      mediaLibrary: {
        status: normalizeStatus(mediaLibrary.granted, mediaLibrary.status),
        granted: mediaLibrary.granted,
        canAskAgain: mediaLibrary.canAskAgain,
      },
    };
  },

  async requestAllPermissions(): Promise<AppPermissions> {
    const [camera, mediaLibrary] = await Promise.all([
      PermissionService.requestCameraPermission(),
      PermissionService.requestMediaLibraryPermission(),
    ]);

    return { camera, mediaLibrary };
  },

  isGranted: (status: PermissionStatus): boolean => status === "granted",

  shouldOpenSettings(details: AppPermissionDetails): boolean {
    const cameraBlocked = details.camera.status === "denied" && !details.camera.canAskAgain;
    const mediaBlocked =
      details.mediaLibrary.status === "denied" && !details.mediaLibrary.canAskAgain;

    return cameraBlocked || mediaBlocked;
  },

  async openAppSettings(): Promise<void> {
    await Linking.openSettings();
  },
};

export default PermissionService;
