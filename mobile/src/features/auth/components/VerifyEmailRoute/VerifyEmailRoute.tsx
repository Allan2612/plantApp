import { useVerifyEmailRoute } from "@/src/features/auth/hooks/useVerifyEmailRoute";
import VerifyEmailScreen from "@/src/features/auth/screens/VerifyEmailScreen/VerifyEmailScreen";

export default function VerifyEmailRoute() {
  const {
    email,
    loading,
    error,
    successMessage,
    onRefreshVerification,
    onResendEmail,
  } = useVerifyEmailRoute();

  return (
    <VerifyEmailScreen
      email={email}
      loading={loading}
      error={error}
      successMessage={successMessage}
      onRefreshVerification={onRefreshVerification}
      onResendEmail={onResendEmail}
    />
  );
}
