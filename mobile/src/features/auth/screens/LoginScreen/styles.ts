import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing }: AppTheme) {
  return StyleSheet.create({
    form: {
      gap: spacing.sm + spacing.xs,
    },
    separatorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    separatorLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.surfaceDivider,
    },
    separatorText: {
      textAlign: "center",
    },
  });
}
