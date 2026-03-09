import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    image: {
      width: "100%",
      height: 140,
      borderRadius: radius.md,
    },
    content: {
      marginTop: spacing.sm,
    },
    description: {
      marginTop: spacing.xs,
    },
  });
}
