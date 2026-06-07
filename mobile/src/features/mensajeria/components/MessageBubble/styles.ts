import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      width: "100%",
      marginVertical: theme.spacing.xs / 2,
      paddingHorizontal: theme.spacing.md,
    },
    rowMine: {
      alignItems: "flex-end",
    },
    rowTheirs: {
      alignItems: "flex-start",
    },
    bubble: {
      maxWidth: "82%",
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    bubbleMine: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: theme.radius.sm,
    },
    bubbleTheirs: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: theme.radius.sm,
    },
    sender: {
      marginBottom: 2,
      fontWeight: "600",
    },
    media: {
      width: 200,
      height: 200,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceAlt,
    },
    fileChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      maxWidth: 220,
    },
    fileName: {
      flexShrink: 1,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 3,
      marginTop: 2,
    },
    metaIcon: {
      marginHorizontal: 1,
    },
  });
}
