import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({
  colors,
  spacing,
  radius,
  typography,
}: AppTheme) {
  const panelMaxHeight = "86%" as const;
  const previewHeight = spacing.xxl + spacing.xl;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.cardOverlay,
    },
    panel: {
      width: "100%",
      maxHeight: panelMaxHeight,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surface,
      overflow: "hidden",
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    header: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.xs,
    },
    closeText: {
      ...typography.caption,
      color: colors.primary,
    },
    modalScroll: {
      width: "100%",
    },
    formBody: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    groupedField: {
      gap: spacing.xs,
    },
    fieldLabel: {
      ...typography.label,
      color: colors.textSecondary,
    },
    helperText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
    previewFrame: {
      width: "100%",
      height: previewHeight,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    fallbackText: {
      color: colors.textSecondary,
      textAlign: "center",
    },
    actions: {
      gap: spacing.sm,
    },
    actionButton: {
      width: "100%",
    },
  });
}
