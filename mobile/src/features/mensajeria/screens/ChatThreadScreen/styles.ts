import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.surfaceDivider,
    },
    headerTitle: {
      flex: 1,
    },
    list: {
      paddingVertical: theme.spacing.sm,
      flexGrow: 1,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: theme.colors.cardOverlay,
      paddingTop: 90,
      paddingHorizontal: theme.spacing.md,
      alignItems: "flex-end",
    },
    menu: {
      width: 280,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.surfaceDivider,
    },
    menuTitle: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    menuItemBody: {
      flex: 1,
    },
  });
}
