import { useGoogleLogin } from "@/src/features/auth/hooks/useGoogleLogin";
import { useLogin } from "@/src/features/auth/hooks/useLogin";
import LoginScreen from "@/src/features/auth/screens/LoginScreen/LoginScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function LoginRoute() {
  const router = useRouter();
  const { submit, loading, error } = useLogin();
  const {
    submitGoogle,
    loading: googleLoading,
    error: googleError,
    isConfigured: isGoogleConfigured,
  } = useGoogleLogin();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!error) return;
    showToast(error, "error");
  }, [error, showToast]);

  useEffect(() => {
    if (!googleError) return;
    showToast(googleError, "error");
  }, [googleError, showToast]);

  const handleSubmit = () => {
    submit(email, password);
  };

  return (
    <LoginScreen
      email={email}
      password={password}
      loading={loading || googleLoading}
      error={error ?? googleError}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onGoogleSubmit={isGoogleConfigured ? submitGoogle : undefined}
      googleLoading={googleLoading}
      onGoToRegister={() => router.push("/(auth)/register")}
      onGoToForgotPassword={() => router.push("/(auth)/forgot-password")}
    />
  );
}
