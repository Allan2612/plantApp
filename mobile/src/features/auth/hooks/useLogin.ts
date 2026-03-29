import { useState } from "react";

import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import {
  loginWithEmail,
  logoutUser,
} from "@/src/features/auth/services/authFirebase.service";
import { useAuthStore } from "@/src/store/auth.store";

export function useLogin() {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);
  const resetAuthState = useAuthStore((state) => state.resetAuthState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(email, password);

      const resolution = await fetchProfileForSession({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        providerId: user.providerData?.[0]?.providerId ?? null,
      });

      if (!resolution?.profile) {
        await logoutUser();
        throw new Error(
          "No pudimos validar tu perfil en este momento. Inténtalo nuevamente en unos segundos.",
        );
      }

      setFirebaseUser(user);
      setProfile(resolution.profile);
      setSessionStatus("authenticated");
    } catch (err) {
      resetAuthState();
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
