import { useState } from "react";

import { fetchUserProfile } from "@/src/services/api/authApi.service";
import { registerWithEmail } from "@/src/services/firebase/auth.service";
import { useAuthStore } from "@/src/stores/auth.store";

export function useRegister() {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const user = await registerWithEmail(email, password);
      setFirebaseUser(user);
      setSessionStatus("authenticated");

      try {
        const profile = await fetchUserProfile(user.uid);
        setProfile(profile);
      } catch (profileError) {
        console.warn("[Auth][register] profile load failed", profileError);
        setProfile(null);
      }

      const message =
        "Te enviamos un correo de confirmación. Revisa también la carpeta de spam o promociones.";
      setSuccessMessage(message);
      return { ok: true as const, message };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo crear la cuenta.";
      setError(message);
      return { ok: false as const, message };
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, successMessage };
}
