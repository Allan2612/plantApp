import { useForgotPassword } from "@/src/features/auth/hooks/useForgotPassword";
import ForgotPasswordScreen from "@/src/features/auth/screens/ForgotPasswordScreen/ForgotPasswordScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const { submit, loading, error, successMessage } = useForgotPassword();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  useEffect(() => {
    if (successMessage) showToast(successMessage, "success");
  }, [showToast, successMessage]);

  const handleSubmit = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      showToast("Ingresa un correo valido.", "error");
      return;
    }

    submit(normalizedEmail);
  };

  return (
    <ForgotPasswordScreen
      email={email}
      loading={loading}
      error={error}
      successMessage={successMessage}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
      onGoToLogin={() => router.replace("/(auth)/login")}
    />
  );
}
