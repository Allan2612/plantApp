import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, radius, spacing }: AppTheme) {
  return StyleSheet.create({
    googleButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.full,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "center",
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    googleButtonDisabled: {
      opacity: 0.6,
    },
    googleIconWrap: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.full,
      height: 28,
      justifyContent: "center",
      width: 28,
    },
    googleLabel: {
      letterSpacing: 0.2,
    },
    googleErrorText: {
      marginBottom: spacing.xs,
      marginTop: -spacing.xs,
      textAlign: "center",
    },
    form: {
      gap: spacing.sm + spacing.xs,
    },
  });
}
