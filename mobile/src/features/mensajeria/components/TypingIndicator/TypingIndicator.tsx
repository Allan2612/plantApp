import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { View } from "react-native";

import { createStyles } from "./styles";

interface TypingIndicatorProps {
  nicknames: string[];
}

export default function TypingIndicator({ nicknames }: TypingIndicatorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (nicknames.length === 0) return null;

  const label =
    nicknames.length === 1
      ? `${nicknames[0]} está escribiendo...`
      : nicknames.length === 2
        ? `${nicknames[0]} y ${nicknames[1]} están escribiendo...`
        : "Varias personas están escribiendo...";

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={theme.colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}
