import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing }: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
  });
}
