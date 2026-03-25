import { Effects } from "@/src/constants/effects";
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles(
  { colors, spacing, radius }: AppTheme,
  topInset = 0,
) {
  return StyleSheet.create({
    wrapper: {
      position: "absolute",
      top: topInset + spacing.sm,
      left: spacing.md,
      right: spacing.md,
      zIndex: 1000,
    },
    toast: {
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs / 2,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: spacing.xs },
      shadowOpacity: Effects.shadowOpacityMedium,
      shadowRadius: spacing.sm,
      elevation: spacing.xs,
    },
  });
}
