import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing }: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      backgroundColor: colors.surface,
      borderBottomColor: colors.surfaceDivider,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
}
