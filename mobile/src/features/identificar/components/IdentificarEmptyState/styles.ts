import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.lg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    iconStack: {
      position: "relative",
      width: 100,
      height: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary + "40",
    },
    cameraChip: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    textBlock: {
      gap: spacing.sm,
      alignItems: "center",
    },
    centerText: {
      textAlign: "center",
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      height: 52,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignSelf: "stretch",
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    secondaryLink: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
  });
}
