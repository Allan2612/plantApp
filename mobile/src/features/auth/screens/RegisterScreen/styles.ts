import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing, colors, radius, typography }: AppTheme) {
  return StyleSheet.create({
    form: {
      gap: spacing.sm + spacing.xs,
    },
    termsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    checkbox: {
      width: spacing.md + spacing.xs,
      height: spacing.md + spacing.xs,
      borderRadius: radius.sm / 2,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.xs / 2,
    },
    checkIcon: {
      fontSize: typography.caption.fontSize,
      lineHeight: spacing.md - spacing.xs,
      color: colors.textOnOverlay,
      fontWeight: "700",
    },
    termsText: {
      flex: 1,
    },
    termsError: {
      marginTop: spacing.xs,
    },
  });
}
