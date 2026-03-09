import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    base: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.lg,
    },
    primaryBg: {
      backgroundColor: colors.primary,
    },
    secondaryBg: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    disabledBg: {
      backgroundColor: colors.surfaceAlt,
    },
    label: {
      fontWeight: "600",
    },
  });
}
