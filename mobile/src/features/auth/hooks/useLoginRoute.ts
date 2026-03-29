import { useLogin } from "@/src/features/auth/hooks/useLogin";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export function useLoginRoute() {
  const router = useRouter();
  const { submit, loading, error } = useLogin();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fieldErrors = useMemo<LoginFieldErrors>(() => {
    const normalizedEmail = email.trim().toLowerCase();
    const errors: LoginFieldErrors = {};

    if (!normalizedEmail) {
      errors.email = "Ingresa tu correo.";
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = "Ingresa un correo valido.";
    }

    if (!password.trim()) {
      errors.password = "Ingresa tu contraseña.";
    }

    return errors;
  }, [email, password]);

  const firstFieldError = useMemo(() => {
    return fieldErrors.email || fieldErrors.password || null;
  }, [fieldErrors.email, fieldErrors.password]);

  useEffect(() => {
    if (!error) return;
    showToast(error, "error");
  }, [error, showToast]);

  const onSubmit = () => {
    setSubmitted(true);
    if (firstFieldError) {
      showToast(firstFieldError, "error");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    submit(normalizedEmail, password);
  };

  return {
    email,
    password,
    loading,
    error,
    fieldErrors: submitted ? fieldErrors : undefined,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit,
    onGoToRegister: () => router.push("/(auth)/register" as never),
    onGoToForgotPassword: () => router.push("/(auth)/forgot-password" as never),
  };
}
