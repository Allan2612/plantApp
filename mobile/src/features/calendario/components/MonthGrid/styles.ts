import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    weekdayRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.xs,
    },
    weekdayCell: {
      flex: 1,
      alignItems: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
    },
    dayCellSelected: {
      backgroundColor: theme.colors.primary,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 3,
      marginTop: 2,
      minHeight: 6,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
  });
}
