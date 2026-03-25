import { useAuthSession } from "@/src/hooks/auth/useAuthSession";
import { useVerifyEmail } from "@/src/hooks/auth/useVerifyEmail";
import VerifyEmailScreen from "@/src/screens/Auth/VerifyEmailScreen/VerifyEmailScreen";
import { useToast } from "@/src/context/ToastContext/ToastContext";
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
