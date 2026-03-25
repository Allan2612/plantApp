import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: spacing.xs,
      width: "100%",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs,
      fontSize: 15,
    },
    inputError: {
      borderColor: colors.danger,
    },
  });
}
