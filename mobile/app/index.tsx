import { Redirect } from "expo-router";
import { useAuthSession } from "@/src/hooks/auth/useAuthSession";

export default function Index() {
  const { isChecking, isAuthenticated, isEmailVerified } = useAuthSession();

  if (isChecking) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isEmailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
