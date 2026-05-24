import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "@/src/components/shared/AppText/AppText";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { containerInset, createStyles } from "./styles";

export default function AppHeader() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { top } = useSafeAreaInsets();
  const scrollAnim = useScrollAnim();

  return (
    <View
      onLayout={(e) => scrollAnim?.setHeaderHeight(e.nativeEvent.layout.height)}
      style={[styles.container, containerInset(top, theme.spacing.sm)]}
      accessibilityRole="header"
    >
      <View style={styles.left}>
        <Ionicons
          name="leaf"
          size={24}
          color={colors.primary}
          style={styles.logo}
        />
        <AppText color={colors.primary} style={styles.appName}>
          PlanTica
        </AppText>
      </View>

      <ProfileMenu />
    </View>
  );
}
