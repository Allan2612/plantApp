import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  const imageHeight = spacing.xxl * 3;

  return StyleSheet.create({
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.surface,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    image: {
      width: "100%",
      height: imageHeight,
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
