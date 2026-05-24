import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl + spacing.xl,
    },
    header: {
      paddingBottom: spacing.md,
      paddingTop: spacing.sm,
      gap: spacing.xs,
    },
    cardWrapper: {
      flex: 1,
    },
    // Dashboard
    dashboardRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xs,
      gap: spacing.md,
    },
    dashboardStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    dashboardValue: {
      fontSize: 15,
      fontWeight: "700",
    },
    dashboardLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    errorCard: {
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    errorCardText: {
      color: colors.danger,
    },
    // FAB
    fab: {
      position: "absolute",
      bottom: spacing.xxl + spacing.md,
      right: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    // Modal
    fieldBlock: {
      width: "100%",
      gap: spacing.xs,
    },
    fieldLabel: {
      color: colors.textPrimary,
    },
    editHeaderRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    closeEditText: {
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.cardOverlay,
      justifyContent: "flex-end",
    },
    modalCard: {
      width: "100%",
      maxHeight: "88%",
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    modalScroll: { width: "100%" },
    modalContent: { gap: spacing.md, paddingBottom: spacing.md },
    errorText: { color: colors.danger },
    dateSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 44,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
    },
    dateSelectorText: { flex: 1 },
    clearDateAction: { alignSelf: "flex-start", paddingTop: spacing.xs },
    clearDateText: { color: colors.danger },
    favoriteToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    favoriteToggleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    favoriteText: { color: colors.textSecondary },
  });
}
