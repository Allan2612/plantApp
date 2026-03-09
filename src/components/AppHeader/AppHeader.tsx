import { useAppTheme } from "@/src/theme/designSystem";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../AppText/AppText";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { createStyles } from "./AppHeader.styles";

export default function AppHeader() {
  const theme = useAppTheme();
  const { colors, spacing } = theme;
  const styles = createStyles(theme);
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: top + spacing.sm + 4 }]}
      accessibilityRole="header"
    >
      <View style={styles.left}>
        <Ionicons name="leaf" size={24} color={colors.primary} />
        <AppText
          variant="subheading"
          color={colors.primary}
          style={{ marginLeft: spacing.sm }}
        >
          PlantApp
        </AppText>
      </View>

      <ProfileMenu />
    </View>
  );
}
