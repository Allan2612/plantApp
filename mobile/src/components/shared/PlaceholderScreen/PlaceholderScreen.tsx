import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { createStyles } from "./styles";

interface PlaceholderScreenProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export default function PlaceholderScreen({
  icon,
  title,
  subtitle,
}: PlaceholderScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Ionicons name={icon} size={48} color={colors.primary} />
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        <AppText
          variant="body"
          color={colors.textSecondary}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      </View>
    </ScreenWrapper>
  );
}
