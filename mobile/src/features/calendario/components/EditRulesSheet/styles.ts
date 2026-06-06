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
      maxHeight: "85%",
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
    rulesList: {
      maxHeight: 240,
    },
    ruleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
    },
    iconBubble: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    ruleBody: {
      flex: 1,
    },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceDivider,
    },
    sectionLabel: {
      marginTop: theme.spacing.sm,
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
    row: {
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    inputSmall: {
      width: 80,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
  });
}
