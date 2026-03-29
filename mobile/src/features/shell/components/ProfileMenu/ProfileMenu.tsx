import { useAppTheme } from "@/src/theme/ThemeContext";
import { useProfileMenu } from "@/src/features/shell/hooks/useProfileMenu";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, Pressable, View } from "react-native";
import AppText from "@/src/components/shared/AppText/AppText";
import { createStyles } from "./styles";

export default function ProfileMenu() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { visible, setVisible, avatarUri, loading, menuItems } =
    useProfileMenu();

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
                  color={item.danger ? colors.danger : colors.textPrimary}
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
