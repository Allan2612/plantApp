import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.xs,
    },
    cardDone: {
      opacity: 0.6,
    },
    iconBubble: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flex: 1,
      gap: 2,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    actionBtnGhost: {
      backgroundColor: theme.colors.surfaceDivider,
    },
  });
}
