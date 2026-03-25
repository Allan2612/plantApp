import AnimatedTabBar from "@/src/features/shell/components/AnimatedTabBar/AnimatedTabBar";
import AppHeader from "@/src/features/shell/components/AppHeader/AppHeader";
import { ScrollAnimProvider } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { isChecking, isAuthenticated, isEmailVerified } = useAuthSession();

  if (isChecking) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isEmailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return (
    <ScrollAnimProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
          }}
          tabBar={(props) => <AnimatedTabBar {...props} />}
        >
          <Tabs.Screen
            name="home"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="catalogo"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "leaf" : "leaf-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="calendario"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "calendar" : "calendar-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="identificar"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "scan" : "scan-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="misplantas"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "flower" : "flower-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null,
            }}
          />
        </Tabs>
        <AppHeader />
      </View>
    </ScrollAnimProvider>
  );
}
