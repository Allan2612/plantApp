import { useForgotPassword } from "@/src/features/auth/hooks/useForgotPassword";
import { useToast } from "@/src/providers/ToastProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export function useForgotPasswordRoute() {
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

  return {
    email,
    setEmail,
    loading,
    error,
    successMessage,
    onSubmit: () => submit(email),
    onGoToLogin: () => router.replace("/(auth)/login" as never),
  };
}
