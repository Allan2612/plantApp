import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: spacing.xxl + spacing.sm,
      paddingRight: spacing.sm + 4,
    },
    menu: {
      minWidth: 200,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderColor: colors.surfaceDivider,
      padding: spacing.xs,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    menuItemDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceDivider,
    },
    menuItemLabel: {
      marginLeft: spacing.sm,
    },
  });
}
