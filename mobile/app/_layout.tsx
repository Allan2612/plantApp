import { ThemeProvider, useAppTheme } from "@/src/theme/ThemeContext";
import { ToastProvider } from "@/src/providers/ToastProvider";
import { useAuthBootstrap } from "@/src/features/auth/hooks/useAuthBootstrap";
import { useAuthStore } from "@/src/store/auth.store";
import {
  Caveat_400Regular,
  Caveat_700Bold,
  useFonts,
} from "@expo-google-fonts/caveat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createRootStackScreenOptions } from "@/src/features/shell/styles/rootLayout.styles";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors } = useAppTheme();
  useAuthBootstrap();
  const sessionStatus = useAuthStore((state) => state.sessionStatus);

  // Mientras se resuelve la sesión, mostrar un loader en vez de pantalla negra
  // (las rutas renderizan null durante "checking").
  if (sessionStatus === "checking") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        ...createRootStackScreenOptions(colors),
        headerTintColor: colors.textPrimary,
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
      <Stack.Screen
        name="user/[userId]"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="mensajeria"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="chat/[threadId]"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Caveat_400Regular,
    Caveat_700Bold,
  });

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
