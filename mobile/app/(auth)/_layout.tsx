import { useAuthSession } from "@/src/hooks/auth/useAuthSession";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isChecking, isAuthenticated, isEmailVerified } = useAuthSession();

  if (isChecking) return null;

  if (isAuthenticated && isEmailVerified) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
