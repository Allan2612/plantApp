import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useVerifyEmail } from "@/src/features/auth/hooks/useVerifyEmail";
import VerifyEmailScreen from "@/src/features/auth/screens/VerifyEmailScreen/VerifyEmailScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useEffect } from "react";

export default function VerifyEmailRoute() {
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

  return (
    <VerifyEmailScreen
      email={user?.email ?? "tu correo"}
      loading={loading}
      error={error}
      successMessage={successMessage}
      onRefreshVerification={refreshVerification}
      onResendEmail={resendEmail}
    />
  );
}
