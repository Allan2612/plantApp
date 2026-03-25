import { useState } from "react";

import { fetchUserProfile } from "@/src/features/profile/services/profileApi.service";
import { loginWithEmail } from "@/src/features/auth/services/authFirebase.service";
import { useAuthStore } from "@/src/store/auth.store";

export function useLogin() {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(email, password);
      setFirebaseUser(user);
      setSessionStatus("authenticated");

      try {
        const profile = await fetchUserProfile(user.uid);
        setProfile(profile);
      } catch (profileError) {
        console.warn("[Auth][login] profile load failed", profileError);
        setProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
