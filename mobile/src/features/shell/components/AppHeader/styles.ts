import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet, ViewStyle } from "react-native";

/** SVG viewBox is 250 × 350, so aspect ratio is 5 : 7 */
export function createStyles({ colors, spacing, typography }: AppTheme) {
  const logoHeight = spacing.xl + spacing.xs;
  const logoWidth = Math.round(logoHeight * (250 / 350));
  const displayFontSize = typography.display.fontSize ?? spacing.xl;

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
      height: logoHeight,
      width: logoWidth,
    },
    appName: {
      fontFamily: "Caveat_700Bold",
      fontSize: displayFontSize,
      lineHeight: displayFontSize + spacing.xs,
      color: colors.primary,
    },
  });
}

export function containerInset(top: number, sm: number): ViewStyle {
  return { paddingTop: top + sm };
}
