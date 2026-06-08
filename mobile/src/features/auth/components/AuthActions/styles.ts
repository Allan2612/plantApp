import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing }: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    feedbackText: {
      textAlign: "center",
    },
    actionButton: {
      width: "100%",
    },
    secondaryLinkContainer: {
      alignItems: "center",
      marginTop: spacing.xs,
    },
    secondaryLinkText: {
      fontWeight: "600",
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
  });
}
