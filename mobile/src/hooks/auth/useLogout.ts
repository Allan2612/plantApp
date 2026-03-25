import { useState } from "react";

import { logoutUser } from "@/src/services/firebase/auth.service";
import { useAuthStore } from "@/src/stores/auth.store";

export function useLogout() {
  const resetAuthState = useAuthStore((state) => state.resetAuthState);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);

    try {
      await logoutUser();
      resetAuthState();
      return { ok: true as const };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cerrar sesión. Inténtalo nuevamente.";
      return { ok: false as const, message };
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}