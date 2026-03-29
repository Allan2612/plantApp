import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius, typography }: AppTheme) {
  return StyleSheet.create({
    container: {
      width: "100%",
      gap: spacing.sm,
    },
    trigger: {
      width: "100%",
      minHeight: spacing.xl + spacing.md,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    triggerActive: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    triggerError: {
      borderColor: colors.danger,
    },
    triggerTextWrap: {
      flex: 1,
      gap: spacing.xs * 0,
    },
    triggerMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    triggerTitle: {
      ...typography.body,
      color: colors.textPrimary,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.cardOverlay,
    },
    overlayBackdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    panel: {
      width: "100%",
      maxHeight: "78%",
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    panelHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    closeText: {
      ...typography.caption,
      color: colors.primary,
    },
    resultMeta: {
      ...typography.caption,
      color: colors.textMuted,
    },
    list: {
      maxHeight: spacing.xxl + spacing.xxl + spacing.xxl + spacing.xl,
    },
    listContent: {
      gap: spacing.xs,
      paddingBottom: spacing.xs,
    },
    row: {
      width: "100%",
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      gap: spacing.xs,
    },
    rowSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    rowHead: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    rowMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    rowTextWrap: {
      flex: 1,
      gap: spacing.xs,
    },
    thumbnailFrame: {
      width: spacing.xl + spacing.xs,
      height: spacing.xl + spacing.xs,
      borderRadius: radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    thumbnailImage: {
      width: "100%",
      height: "100%",
    },
    thumbnailFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    rowTitle: {
      ...typography.label,
      color: colors.textPrimary,
    },
    rowTitleSelected: {
      color: colors.primary,
      fontWeight: "700",
    },
    rowSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    rowSubtitleSelected: {
      color: colors.primary,
    },
    emptyText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.sm,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
  });
}
