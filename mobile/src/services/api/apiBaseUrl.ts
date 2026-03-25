import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

const DEFAULT_API_PORT = "8000";
const DEFAULT_BASE_URL = `http://127.0.0.1:${DEFAULT_API_PORT}`;

export interface ApiBaseUrlResolution {
  baseUrl: string;
  source: "env" | "expo-host" | "android-emulator" | "fallback";
  expoHost: string | null;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLoopbackUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function getExpoHost(): string | null {
  const fromLinking = Linking.parse(Linking.createURL("/")).hostname;
  if (fromLinking) return fromLinking;

  const fromExpoConfig = (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;
  if (fromExpoConfig) return fromExpoConfig.split(":")[0] ?? null;

  const fromManifest2 = (
    Constants as unknown as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } }
  ).manifest2?.extra?.expoClient?.hostUri;
  if (fromManifest2) return fromManifest2.split(":")[0] ?? null;

  const fromLegacyManifest = (
    Constants as unknown as { manifest?: { debuggerHost?: string } }
  ).manifest?.debuggerHost;
  if (fromLegacyManifest) return fromLegacyManifest.split(":")[0] ?? null;

  return null;
}

export function getApiBaseUrl(): string {
  return getApiBaseUrlResolution().baseUrl;
}

export function getApiBaseUrlResolution(): ApiBaseUrlResolution {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const expoHost = getExpoHost();

  if (configured && !isLoopbackUrl(configured)) {
    return {
      baseUrl: stripTrailingSlash(configured),
      source: "env",
      expoHost,
    };
  }

  if (expoHost && !isLoopbackUrl(expoHost)) {
    return {
      baseUrl: `http://${expoHost}:${DEFAULT_API_PORT}`,
      source: "expo-host",
      expoHost,
    };
  }

  if (Platform.OS === "android") {
    return {
      baseUrl: `http://10.0.2.2:${DEFAULT_API_PORT}`,
      source: "android-emulator",
      expoHost,
    };
  }

  return {
    baseUrl: stripTrailingSlash(configured || DEFAULT_BASE_URL),
    source: "fallback",
    expoHost,
  };
}
