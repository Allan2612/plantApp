import { useLogin } from "@/src/features/auth/hooks/useLogin";
import LoginScreen from "@/src/features/auth/screens/LoginScreen/LoginScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function LoginRoute() {
  const router = useRouter();
  const { submit, loading, error } = useLogin();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!error) return;
    showToast(error, "error");
  }, [error, showToast]);

  const handleSubmit = () => {
    submit(email, password);
  };

  return (
    <LoginScreen
      email={email}
      password={password}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onGoToRegister={() => router.push("/(auth)/register")}
      onGoToForgotPassword={() => router.push("/(auth)/forgot-password")}
    />
  );
}
