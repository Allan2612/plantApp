import AnimatedTabBar from "@/src/components/AnimatedTabBar/AnimatedTabBar";
import AppHeader from "@/src/components/AppHeader/AppHeader";
import { ScrollAnimProvider } from "@/src/context/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  const { colors } = useAppTheme();

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
