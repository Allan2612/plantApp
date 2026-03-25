import { useRegister } from "@/src/features/auth/hooks/useRegister";
import RegisterScreen from "@/src/features/auth/screens/RegisterScreen/RegisterScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

export default function RegisterRoute() {
  const router = useRouter();
  const { submit, loading, error } = useRegister();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const localError = useMemo(() => {
    if (!confirmPassword) return null;
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    return null;
  }, [confirmPassword, password]);

  const handleSubmit = async () => {
    if (localError) return;

    const result = await submit(email, password);

    if (result.ok) {
      showToast(result.message, "success");
      router.replace("/(auth)/verify-email");
      return;
    }

    showToast(result.message, "error");
  };

  return (
    <RegisterScreen
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      loading={loading}
      error={localError ?? error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
      onGoToLogin={() => router.replace("/(auth)/login")}
    />
  );
}
