import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },

    centerText: {
      textAlign: "center",
    },

    permissionCard: {
      width: "100%",
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      gap: spacing.sm,
    },

    permissionCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    permissionCardTitle: {
      flex: 1,
    },
  });
}
