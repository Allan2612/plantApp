import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing, colors }: AppTheme) {
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
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    checkIcon: {
      fontSize: 12,
      lineHeight: 12,
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
