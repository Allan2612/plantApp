import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: spacing.sm,
      width: "100%",
    },
    label: {
      fontSize: spacing.md - spacing.xs / 2,
      lineHeight: spacing.md + spacing.xs / 2,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      color: colors.textPrimary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: spacing.xl + spacing.md + spacing.xs,
      fontSize: spacing.md - spacing.xs / 4,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    inputError: {
      borderColor: colors.danger,
    },
  });
}
