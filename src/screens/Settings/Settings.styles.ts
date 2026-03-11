import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: spacing.md,
      gap: spacing.lg,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    sectionTitle: {
      marginBottom: spacing.xs,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
    },
    optionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    optionActive: {
      backgroundColor: colors.surfaceAlt,
    },
    checkIcon: {
      width: 24,
      alignItems: "center",
    },
  });
}
