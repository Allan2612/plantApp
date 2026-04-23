import { useGoogleLogin } from "@/src/features/auth/hooks/useGoogleLogin";
import { useRegister } from "@/src/features/auth/hooks/useRegister";
import RegisterScreen from "@/src/features/auth/screens/RegisterScreen/RegisterScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterRoute() {
  const router = useRouter();
  const { submit, loading, error } = useRegister();
  const {
    submitGoogle,
    loading: googleLoading,
    error: googleError,
  } = useGoogleLogin();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [slowApi, setSlowApi] = useState(false);

  const localError = useMemo(() => {
    if (!confirmPassword) return null;
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    return null;
  }, [confirmPassword, password]);

  useEffect(() => {
    if (!googleError) return;
    showToast(googleError, "error");
  }, [googleError, showToast]);

  useEffect(() => {
    if (!loading && !googleLoading) {
      setSlowApi(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setSlowApi(true);
    }, 8000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [googleLoading, loading]);

  const loadingHint = !loading && !googleLoading
    ? null
    : slowApi
      ? "Estamos despertando el servidor. Esto puede tardar hasta 1 minuto."
      : "Conectando con la API...";

  const handleSubmit = async () => {
    if (localError) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      showToast("Debes ingresar un correo.", "error");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      showToast("Correo inválido.", "error");
      return;
    }

    if (!normalizedPassword) {
      showToast("Debes ingresar una contraseña.", "error");
      return;
    }

    const result = await submit(normalizedEmail, password);

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
      loadingHint={loadingHint}
      error={localError ?? error}
      googleError={googleError}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
      onGoogleSubmit={submitGoogle}
      googleLoading={googleLoading}
      onGoToLogin={() => router.replace("/(auth)/login")}
    />
  );
}
