import { useForgotPasswordRoute } from "@/src/features/auth/hooks/useForgotPasswordRoute";
import ForgotPasswordScreen from "@/src/features/auth/screens/ForgotPasswordScreen/ForgotPasswordScreen";

export default function ForgotPasswordRoute() {
  const {
    email,
    setEmail,
    loading,
    error,
    successMessage,
    onSubmit,
    onGoToLogin,
  } = useForgotPasswordRoute();

  return (
    <ForgotPasswordScreen
      email={email}
      loading={loading}
      error={error}
      successMessage={successMessage}
      onEmailChange={setEmail}
      onSubmit={onSubmit}
      onGoToLogin={onGoToLogin}
    />
  );
}
