import { useRegister } from "@/src/features/auth/hooks/useRegister";
import RegisterScreen from "@/src/features/auth/screens/RegisterScreen/RegisterScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

type RegisterFieldErrors = {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
};

export default function RegisterRoute() {
  const router = useRouter();
  const { submit, loading, error } = useRegister();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fieldErrors = useMemo<RegisterFieldErrors>(() => {
    const normalizedDisplayName = displayName.trim();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const errors: RegisterFieldErrors = {};

    if (!normalizedDisplayName) {
      errors.displayName = "Ingresa tu nombre visible.";
    }

    if (normalizedDisplayName.length < 2) {
      errors.displayName = "Tu nombre debe tener al menos 2 caracteres.";
    }

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      errors.username = "El usuario debe tener 3-20 caracteres (letras, numeros, _ o -).";
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = "Ingresa un correo valido.";
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      errors.password = "Usa minimo 8 caracteres con letras, numeros y simbolos.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña.";
    }

    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!acceptedTerms) {
      errors.acceptedTerms = "Debes aceptar los terminos de uso y la politica de privacidad.";
    }

    return errors;
  }, [acceptedTerms, confirmPassword, displayName, email, password, username]);

  const firstFieldError = useMemo(() => {
    return (
      fieldErrors.displayName ||
      fieldErrors.username ||
      fieldErrors.email ||
      fieldErrors.password ||
      fieldErrors.confirmPassword ||
      fieldErrors.acceptedTerms ||
      null
    );
  }, [fieldErrors]);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (firstFieldError) {
      showToast(firstFieldError, "error");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedDisplayName = displayName.trim();

    const result = await submit(
      normalizedEmail,
      password,
      normalizedDisplayName,
      normalizedUsername,
      acceptedTerms,
    );

    if (result.ok) {
      showToast(result.message, "success");
      router.replace("/(auth)/verify-email");
      return;
    }

    showToast(result.message, "error");
  };

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
      fieldErrors={submitted ? fieldErrors : undefined}
      onDisplayNameChange={setDisplayName}
      onUsernameChange={setUsername}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onToggleAcceptedTerms={() => setAcceptedTerms((prev) => !prev)}
      onSubmit={handleSubmit}
      onGoToLogin={() => router.replace("/(auth)/login")}
    />
  );
}
