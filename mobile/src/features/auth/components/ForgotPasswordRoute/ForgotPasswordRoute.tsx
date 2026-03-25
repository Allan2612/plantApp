import { useForgotPassword } from "@/src/features/auth/hooks/useForgotPassword";
import ForgotPasswordScreen from "@/src/features/auth/screens/ForgotPasswordScreen/ForgotPasswordScreen";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

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

  return (
    <ForgotPasswordScreen
      email={email}
      loading={loading}
      error={error}
      successMessage={successMessage}
      onEmailChange={setEmail}
      onSubmit={() => submit(email)}
      onGoToLogin={() => router.replace("/(auth)/login")}
    />
  );
}
