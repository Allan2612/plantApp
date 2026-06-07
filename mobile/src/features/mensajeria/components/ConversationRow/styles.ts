import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    onlineDot: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    body: {
      flex: 1,
    },
    subtitle: {
      marginTop: 2,
    },
  });
}
