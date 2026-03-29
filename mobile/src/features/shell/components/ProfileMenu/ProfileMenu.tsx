import { useAppTheme } from "@/src/theme/ThemeContext";
import { useToast } from "@/src/providers/ToastProvider";
import { useLogout } from "@/src/features/auth/hooks/useLogout";
import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useAuthStore } from "@/src/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, View } from "react-native";
import AppText from "@/src/components/shared/AppText/AppText";
import { createStyles } from "./styles";

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function getAvatarUri(avatarId?: string | null): string | null {
  if (!avatarId?.trim()) return null;
  const normalized = avatarId.trim();
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return null;
}

export default function ProfileMenu() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const router = useRouter();
  const { showToast } = useToast();
  const { logout, loading } = useLogout();
  const { user } = useAuthSession();
  const [visible, setVisible] = useState(false);
  const profile = useAuthStore((state) => state.profile);
  const avatarUri =
    getAvatarUri(profile?.user?.avatarId) ??
    getAvatarUri(user?.photoURL ?? null);

  const menuItems: MenuItem[] = [
    {
      label: "Ver mi perfil",
      icon: "person-outline",
      onPress: () => {
        setVisible(false);
        router.push("/profile");
      },
    },
    {
      label: "Configuración",
      icon: "settings-outline",
      onPress: () => {
        setVisible(false);
        router.push("/settings");
      },
    },
    {
      label: "Cerrar sesión",
      icon: "log-out-outline",
      onPress: async () => {
        setVisible(false);
        const result = await logout();

        if (!result.ok) {
          showToast(result.message, "error");
          return;
        }

        showToast("Sesión cerrada correctamente.", "success");
      },
    },
  ];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú de usuario"
        hitSlop={8}
      >
        <View style={styles.avatarButton}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={colors.primary}
            />
          )}
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                disabled={loading}
                accessibilityRole="menuitem"
                accessibilityLabel={item.label}
                style={({ pressed }) => [
                  styles.menuItem,
                  (pressed || loading) && styles.menuItemPressed,
                  index < menuItems.length - 1 && styles.menuItemDivider,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={colors.textSecondary}
                />
                <AppText
                  variant="body"
                  style={styles.menuItemLabel}
                  color={
                    item.icon === "log-out-outline"
                      ? colors.danger
                      : colors.textPrimary
                  }
                >
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
