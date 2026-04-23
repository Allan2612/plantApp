import { Camera } from "expo-camera";
import Constants from "expo-constants";
import * as MediaLibrary from "expo-media-library";
import { Linking } from "react-native";

// expo-media-library no tiene acceso completo en Expo Go en Android
const IS_EXPO_GO = Constants.executionEnvironment === "storeClient";

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

const MEDIA_LIBRARY_PERMISSIONS: MediaLibrary.GranularPermission[] = ["photo"];

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
    if (IS_EXPO_GO) return "granted";
    const { granted, status } = await MediaLibrary.requestPermissionsAsync(
      false,
      MEDIA_LIBRARY_PERMISSIONS
    );
    return normalizeStatus(granted, status);
  },

  async checkAllPermissions(): Promise<AppPermissions> {
    const [camera, mediaLibrary] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      IS_EXPO_GO
        ? Promise.resolve({ granted: true, status: "granted" as const })
        : MediaLibrary.getPermissionsAsync(false, MEDIA_LIBRARY_PERMISSIONS),
    ]);

    return {
      camera: normalizeStatus(camera.granted, camera.status),
      mediaLibrary: normalizeStatus(mediaLibrary.granted, mediaLibrary.status),
    };
  },

  async checkAllPermissionDetails(): Promise<AppPermissionDetails> {
    const [camera, mediaLibrary] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      IS_EXPO_GO
        ? Promise.resolve({ granted: true, status: "granted" as const, canAskAgain: false })
        : MediaLibrary.getPermissionsAsync(false, MEDIA_LIBRARY_PERMISSIONS),
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