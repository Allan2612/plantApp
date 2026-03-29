import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({
  colors,
  spacing,
  radius,
  typography,
}: AppTheme) {
  return StyleSheet.create({
    container: {
      width: "100%",
      gap: spacing.xs,
    },
    label: {
      ...typography.label,
      color: colors.textSecondary,
    },
    input: {
      ...typography.body,
      minHeight: spacing.xxl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    inputError: {
      borderColor: colors.danger,
    },
    helperText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
  });
}
