import { useAppTheme } from "@/src/theme/ThemeContext";
import { Pressable, PressableProps } from "react-native";
import AppText from "../AppText/AppText";
import { createStyles } from "./AppButton.styles";

type ButtonVariant = "primary" | "secondary";

interface AppButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  variant?: ButtonVariant;
}

export default function AppButton({
  title,
  variant = "primary",
  disabled = false,
  style,
  ...rest
}: AppButtonProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  const isPrimary = variant === "primary";

  const textColor = disabled
    ? colors.textMuted
    : isPrimary
      ? colors.background
      : colors.primary;

  return (
    <Pressable
      style={[
        styles.base,
        disabled
          ? styles.disabledBg
          : isPrimary
            ? styles.primaryBg
            : styles.secondaryBg,
        style as object,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
    >
      <AppText variant="label" color={textColor} style={styles.label}>
        {title}
      </AppText>
    </Pressable>
  );
}
