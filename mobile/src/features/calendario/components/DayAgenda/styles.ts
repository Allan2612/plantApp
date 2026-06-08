import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    title: {
      marginBottom: theme.spacing.sm,
    },
    empty: {
      alignItems: "center",
      gap: theme.spacing.xs,
      padding: theme.spacing.lg,
    },
  });
}
