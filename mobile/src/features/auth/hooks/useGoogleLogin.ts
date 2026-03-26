import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { loginWithGoogleIdToken } from "@/src/features/auth/services/authFirebase.service";
import { fetchUserProfile } from "@/src/features/profile/services/profileApi.service";
import { useAuthStore } from "@/src/store/auth.store";

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? "";

export function useGoogleLogin() {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAndroid = Platform.OS === "android";
  const isConfigured = isAndroid && !!ANDROID_CLIENT_ID;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: ANDROID_CLIENT_ID || undefined,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type !== "success") {
      if (response.type !== "cancel" && response.type !== "dismiss") {
        setError("No se pudo autenticar con Google.");
      }
      setLoading(false);
      return;
    }

    const idToken = response.params?.id_token ?? response.authentication?.idToken;
    if (!idToken) {
      setError("Google no devolvió un token válido.");
      setLoading(false);
      return;
    }

    const completeGoogleLogin = async () => {
      try {
        const user = await loginWithGoogleIdToken(idToken);
        setFirebaseUser(user);
        setSessionStatus("authenticated");

        try {
          const profile = await fetchUserProfile(user.uid);
          setProfile(profile);
        } catch (profileError) {
          console.warn("[Auth][googleLogin] profile load failed", profileError);
          setProfile(null);
        }
      } catch (authError) {
        setError(
          authError instanceof Error
            ? authError.message
            : "No se pudo iniciar sesión con Google.",
        );
      } finally {
        setLoading(false);
      }
    };

    completeGoogleLogin().catch((unhandledError) => {
      console.error("[Auth][googleLogin] unexpected error", unhandledError);
      setError("No se pudo iniciar sesión con Google.");
      setLoading(false);
    });
  }, [response, setFirebaseUser, setProfile, setSessionStatus]);

  const submitGoogle = async () => {
    setError(null);

    if (!isAndroid) {
      setError("El inicio con Google está habilitado solo para Android por ahora.");
      return;
    }

    if (!ANDROID_CLIENT_ID) {
      setError(
        "Falta EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID en tu .env para iniciar con Google.",
      );
      return;
    }

    if (!request) {
      setError("Google Auth aún no está listo. Intenta de nuevo en unos segundos.");
      return;
    }

    try {
      setLoading(true);
      await promptAsync();
    } catch (promptError) {
      console.error("[Auth][googleLogin] prompt failed", promptError);
      setError("No se pudo abrir el inicio de sesión con Google.");
      setLoading(false);
    }
  };

  return {
    submitGoogle,
    loading,
    error,
    isConfigured,
  };
}