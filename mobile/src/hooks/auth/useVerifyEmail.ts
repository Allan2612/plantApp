import { useState } from "react";

import {
  refreshCurrentUser,
  resendAccountVerification,
} from "@/src/services/firebase/auth.service";
import { useAuthStore } from "@/src/stores/auth.store";

export function useVerifyEmail() {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resendEmail = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await resendAccountVerification();
      setSuccessMessage(
        "Correo de verificación reenviado. Revisa también spam o promociones.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reenviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  const refreshVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const refreshedUser = await refreshCurrentUser();
      setFirebaseUser(refreshedUser);
      if (!refreshedUser?.emailVerified) {
        setError("Tu correo aún no está verificado.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo verificar el estado.");
    } finally {
      setLoading(false);
    }
  };

  return {
    resendEmail,
    refreshVerification,
    loading,
    error,
    successMessage,
  };
}
