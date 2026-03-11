import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

const PLANT_CARD_IMAGE_HEIGHT = 140;

export function createStyles({ colors, spacing, radius }: AppTheme) {
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
      height: PLANT_CARD_IMAGE_HEIGHT,
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
