import { useAppTheme } from "@/src/theme/designSystem";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import AppText from "./AppText";

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
  const { colors, spacing, radius } = useAppTheme();

  const isPrimary = variant === "primary";

  const backgroundColor = disabled
    ? colors.surfaceAlt
    : isPrimary
      ? colors.primary
      : colors.surface;

  const textColor = disabled
    ? colors.textMuted
    : isPrimary
      ? colors.background
      : colors.primary;

  return (
    <Pressable
      style={[
        styles.base,
        {
          backgroundColor,
          borderRadius: radius.md,
          paddingVertical: spacing.sm + 4,
          paddingHorizontal: spacing.lg,
        },
        !isPrimary && {
          borderWidth: 1,
          borderColor: colors.primary,
        },
        style as object,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      {...rest}
    >
      <AppText variant="label" color={textColor} style={styles.label}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
  },
});
