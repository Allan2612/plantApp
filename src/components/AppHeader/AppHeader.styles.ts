import { Spacing } from "@/src/constants/spacing";
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet, ViewStyle } from "react-native";

const LOGO_HEIGHT = 34;
/** SVG viewBox is 250 × 350, so aspect ratio is 5 : 7 */
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * (250 / 350));

export function createStyles({ colors, spacing }: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.background,
      borderBottomColor: colors.surfaceDivider,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    logo: {
      height: LOGO_HEIGHT,
      width: LOGO_WIDTH,
    },
    appName: {
      fontFamily: "Caveat_700Bold",
      fontSize: 26,
      lineHeight: 30,
      color: colors.primary,
    },
  });
}

export function containerInset(top: number): ViewStyle {
  return { paddingTop: top + Spacing.sm };
}
