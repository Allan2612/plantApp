import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Pressable, View } from "react-native";

import { createStyles } from "./styles";

export type ToastType = "success" | "error" | "info";

interface AppToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export default function AppToast({ message, type, onDismiss }: AppToastProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  const backgroundColor =
    type === "error"
      ? colors.danger
      : type === "success"
        ? colors.primary
        : colors.surfaceAlt;

  const textColor = type === "info" ? colors.textPrimary : colors.textOnOverlay;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        onPress={onDismiss}
        style={[styles.toast, { backgroundColor }]}
        accessibilityRole="alert"
      >
        <AppText variant="caption" color={textColor}>
          {message}
        </AppText>
      </Pressable>
    </View>
  );
}
