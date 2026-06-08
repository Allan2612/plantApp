import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing }: AppTheme) {
  return StyleSheet.create({
    listContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
    },
    header: {
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    separator: {
      height: spacing.sm,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    centerText: {
      textAlign: "center",
    },
  });
}
