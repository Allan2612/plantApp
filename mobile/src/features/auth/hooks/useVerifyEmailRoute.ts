import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useVerifyEmail } from "@/src/features/auth/hooks/useVerifyEmail";
import { useToast } from "@/src/providers/ToastProvider";
import { useEffect } from "react";

export function useVerifyEmailRoute() {
  const { user } = useAuthSession();
  const { showToast } = useToast();
  const { resendEmail, refreshVerification, loading, error, successMessage } =
    useVerifyEmail();

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  useEffect(() => {
    if (successMessage) showToast(successMessage, "success");
  }, [showToast, successMessage]);

  return {
    email: user?.email ?? "tu correo",
    loading,
    error,
    successMessage,
    onRefreshVerification: refreshVerification,
    onResendEmail: resendEmail,
  };
}
