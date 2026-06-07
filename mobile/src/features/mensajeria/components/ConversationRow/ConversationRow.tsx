import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { createStyles } from "./styles";

interface ConversationRowProps {
  title: string;
  subtitle?: string;
  online?: boolean;
  /** Si se pasa, muestra un icono en vez de la inicial. */
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function ConversationRow({
  title,
  subtitle,
  online,
  iconName,
  onPress,
}: ConversationRowProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        {iconName ? (
          <Ionicons name={iconName} size={22} color={theme.colors.textOnOverlay} />
        ) : (
          <AppText variant="subheading" color={theme.colors.textOnOverlay}>
            {initial}
          </AppText>
        )}
        {online ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.body}>
        <AppText variant="subheading" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            numberOfLines={1}
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}
