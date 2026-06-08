import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.surfaceDivider,
      backgroundColor: theme.colors.background,
    },
    attachButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 42,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.searchBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.searchBorder,
      color: theme.colors.textPrimary,
      fontSize: 14,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
  });
}
