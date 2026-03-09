import { useAppTheme } from "@/src/theme/designSystem";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import AppText from "../AppText/AppText";
import { createStyles } from "./ProfileMenu.styles";

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function ProfileMenu() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const router = useRouter();
  const [visible, setVisible] = useState(false);

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
      onPress: () => setVisible(false),
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
        <Ionicons
          name="person-circle-outline"
          size={32}
          color={colors.primary}
        />
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
                accessibilityRole="menuitem"
                accessibilityLabel={item.label}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: colors.surfaceAlt },
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
                      ? "#e53935"
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
