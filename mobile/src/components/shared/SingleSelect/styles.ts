import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius, typography }: AppTheme) {
  return StyleSheet.create({
    row: {
      width: "100%",
      flexDirection: "row",
      alignItems: "stretch",
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      padding: spacing.xs / 2,
      gap: spacing.xs / 2,
      overflow: "hidden",
    },
    rowGrid: {
      flexWrap: "wrap",
      overflow: "visible",
    },
    option: {
      flex: 1,
      minHeight: spacing.xl + spacing.xs,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
      backgroundColor: colors.transparent,
    },
    optionGrid: {
      flexGrow: 1,
      flexBasis: spacing.xxl + spacing.xxl,
    },
    optionActive: {
      backgroundColor: colors.surface,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
      fontWeight: "500",
    },
    labelActive: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
}
