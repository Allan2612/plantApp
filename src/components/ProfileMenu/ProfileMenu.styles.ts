import { Palette } from "@/src/constants/colors";
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

const MENU_MIN_WIDTH = 200;
const MENU_SHADOW_RADIUS = 12;
const MENU_ELEVATION = 8;

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.cardOverlay,
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: spacing.xxl + spacing.sm,
      paddingRight: spacing.sm + 4,
    },
    menu: {
      minWidth: MENU_MIN_WIDTH,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderColor: colors.surfaceDivider,
      padding: spacing.xs,
      elevation: MENU_ELEVATION,
      shadowColor: Palette.black,
      shadowOffset: { width: 0, height: spacing.xs },
      shadowOpacity: 0.3,
      shadowRadius: MENU_SHADOW_RADIUS,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm + 4,
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
