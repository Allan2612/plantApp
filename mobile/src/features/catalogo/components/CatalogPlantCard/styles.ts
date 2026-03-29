import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  const imageHeight = spacing.xxl * 3;

  return StyleSheet.create({
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: imageHeight,
      backgroundColor: colors.surfaceAlt,
    },
    imageFallback: {
      width: "100%",
      height: imageHeight,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs,
      gap: spacing.xs,
    },
    scientificName: {
      textTransform: "capitalize",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.xs,
    },
    badge: {
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm + spacing.xs,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surfaceAlt,
    },
  });
}
