import { useState } from "react";

import { requestPasswordReset } from "@/src/features/auth/services/authFirebase.service";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(email);
      setSuccessMessage(
        "Te enviamos un correo para restablecer la contraseña. Revisa también spam o promociones.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar el correo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, successMessage };
}
