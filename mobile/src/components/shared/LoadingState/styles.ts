import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, typography }: AppTheme) {
  return StyleSheet.create({
    container: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
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
