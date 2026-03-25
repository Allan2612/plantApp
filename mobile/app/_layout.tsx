import { ThemeProvider, useAppTheme } from "@/src/theme/ThemeContext";
import { ToastProvider } from "@/src/providers/ToastProvider";
import { useAuthBootstrap } from "@/src/features/auth/hooks/useAuthBootstrap";
import { Caveat_700Bold, useFonts } from "@expo-google-fonts/caveat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors } = useAppTheme();
  useAuthBootstrap();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: "Mi Perfil",
          presentation: "card",
        }}
      />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: "Configuración",
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Caveat_700Bold });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootStack />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
