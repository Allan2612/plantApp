import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius, typography }: AppTheme) {
  return StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    message: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
}
