import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/designSystem";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      gap: theme.spacing.sm,
    },
    handleBar: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.surfaceDivider,
      marginBottom: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    typeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.xs,
    },
    typeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
    },
    label: {
      marginTop: theme.spacing.sm,
    },
    plantsRow: {
      gap: theme.spacing.xs,
      paddingVertical: 2,
    },
    plantChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
    },
    plantChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
  });
}
