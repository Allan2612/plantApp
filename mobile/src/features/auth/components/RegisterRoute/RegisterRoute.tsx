import { useRegisterRoute } from "@/src/features/auth/hooks/useRegisterRoute";
import RegisterScreen from "@/src/features/auth/screens/RegisterScreen/RegisterScreen";

export default function RegisterRoute() {
  const {
    displayName,
    username,
    email,
    password,
    confirmPassword,
    acceptedTerms,
    loading,
    error,
    fieldErrors,
    onDisplayNameChange,
    onUsernameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onToggleAcceptedTerms,
    onSubmit,
    onGoToLogin,
  } = useRegisterRoute();

  return (
    <RegisterScreen
      displayName={displayName}
      username={username}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      acceptedTerms={acceptedTerms}
      loading={loading}
      error={error}
      fieldErrors={fieldErrors}
      onDisplayNameChange={onDisplayNameChange}
      onUsernameChange={onUsernameChange}
      onEmailChange={onEmailChange}
      onPasswordChange={onPasswordChange}
      onConfirmPasswordChange={onConfirmPasswordChange}
      onToggleAcceptedTerms={onToggleAcceptedTerms}
      onSubmit={onSubmit}
      onGoToLogin={onGoToLogin}
    />
  );
}
