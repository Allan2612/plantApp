import { Effects } from "@/src/constants/effects";
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  const menuMinWidth = spacing.xxl * 4 + spacing.xs;
  const menuShadowRadius = spacing.md - spacing.xs;
  const menuElevation = spacing.sm;
  const avatarSize = spacing.xl + spacing.xs;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.cardOverlay,
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: spacing.xxl + spacing.sm,
      paddingRight: spacing.sm + spacing.xs,
    },
    menu: {
      minWidth: menuMinWidth,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderColor: colors.surfaceDivider,
      padding: spacing.xs,
      elevation: menuElevation,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: spacing.xs },
      shadowOpacity: Effects.shadowOpacityStrong,
      shadowRadius: menuShadowRadius,
    },
    avatarButton: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: radius.full,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: radius.full,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    menuItemDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.surfaceDivider,
    },
    menuItemLabel: {
      marginLeft: spacing.sm,
    },
    menuItemPressed: {
      backgroundColor: colors.surfaceAlt,
    },
  });
}
