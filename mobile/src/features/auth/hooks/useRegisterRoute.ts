import { useRegister } from "@/src/features/auth/hooks/useRegister";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PHONE_REGEX = /^[\d\s+()-]{8,20}$/;

type RegisterFieldErrors = {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  acceptedTerms?: string;
};

export function useRegisterRoute() {
  const router = useRouter();
  const { submit, loading, error } = useRegister();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
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
      errors.username =
        "El usuario debe tener 3-20 caracteres (letras, numeros, _ o -).";
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = "Ingresa un correo valido.";
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      errors.password =
        "Usa minimo 8 caracteres con letras, numeros y simbolos.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña.";
    }

    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    const normalizedPhone = phone.trim();
    if (!normalizedPhone) {
      errors.phone = "Ingresa tu numero de telefono.";
    } else if (!PHONE_REGEX.test(normalizedPhone)) {
      errors.phone = "Numero invalido. Usa entre 8 y 20 digitos.";
    }

    if (!acceptedTerms) {
      errors.acceptedTerms =
        "Debes aceptar los terminos de uso y la politica de privacidad.";
    }

    return errors;
  }, [acceptedTerms, confirmPassword, displayName, email, password, phone, username]);

  const firstFieldError = useMemo(() => {
    return (
      fieldErrors.displayName ||
      fieldErrors.username ||
      fieldErrors.email ||
      fieldErrors.password ||
      fieldErrors.confirmPassword ||
      fieldErrors.phone ||
      fieldErrors.acceptedTerms ||
      null
    );
  }, [fieldErrors]);

  const onSubmit = async () => {
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
      phone.trim(),
      acceptedTerms,
    );

    if (result.ok) {
      showToast(result.message, "success");
      router.replace("/(auth)/verify-email" as never);
      return;
    }

    showToast(result.message, "error");
  };

  return {
    displayName,
    username,
    email,
    password,
    confirmPassword,
    phone,
    acceptedTerms,
    loading,
    error,
    fieldErrors: submitted ? fieldErrors : undefined,
    onDisplayNameChange: setDisplayName,
    onUsernameChange: setUsername,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onPhoneChange: setPhone,
    onToggleAcceptedTerms: () => setAcceptedTerms((prev) => !prev),
    onSubmit,
    onGoToLogin: () => router.replace("/(auth)/login" as never),
  };
}
