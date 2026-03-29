import { useLoginRoute } from "@/src/features/auth/hooks/useLoginRoute";
import LoginScreen from "@/src/features/auth/screens/LoginScreen/LoginScreen";

export default function LoginRoute() {
  const {
    email,
    password,
    loading,
    error,
    fieldErrors,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onGoToRegister,
    onGoToForgotPassword,
  } = useLoginRoute();

  return (
    <LoginScreen
      email={email}
      password={password}
      loading={loading}
      error={error}
      fieldErrors={fieldErrors}
      onEmailChange={onEmailChange}
      onPasswordChange={onPasswordChange}
      onSubmit={onSubmit}
      onGoToRegister={onGoToRegister}
      onGoToForgotPassword={onGoToForgotPassword}
    />
  );
}
