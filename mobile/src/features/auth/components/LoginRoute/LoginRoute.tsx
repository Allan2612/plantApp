import { useGoogleLogin } from "@/src/features/auth/hooks/useGoogleLogin";
import { useLogin } from "@/src/features/auth/hooks/useLogin";
import LoginScreen from "@/src/features/auth/screens/LoginScreen/LoginScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginRoute() {
  const router = useRouter();
  const { submit, loading, error } = useLogin();
  const {
    submitGoogle,
    loading: googleLoading,
    error: googleError,
  } = useGoogleLogin();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slowApi, setSlowApi] = useState(false);

  useEffect(() => {
    if (!error) return;
    showToast(error, "error");
  }, [error, showToast]);

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

  const handleSubmit = () => {
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

    submit(normalizedEmail, password);
  };

  return (
    <LoginScreen
      email={email}
      password={password}
      loading={loading}
      loadingHint={loadingHint}
      error={error}
      googleError={googleError}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onGoogleSubmit={submitGoogle}
      googleLoading={googleLoading}
      onGoToRegister={() => router.push("/(auth)/register")}
      onGoToForgotPassword={() => router.push("/(auth)/forgot-password")}
    />
  );
}
