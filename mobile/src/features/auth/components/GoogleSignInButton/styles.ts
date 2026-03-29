import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.googleButtonBorder,
      backgroundColor: colors.googleButtonBackground,
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.lg,
    },
    disabled: {
      opacity: 0.7,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    label: {
      fontWeight: "600",
    },
  });
}
