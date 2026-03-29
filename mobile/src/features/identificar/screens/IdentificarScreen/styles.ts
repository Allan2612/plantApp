import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    },
    headerCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.xs,
    },
    headerSubtitle: {
      color: colors.textSecondary,
    },
    cameraCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    permissionBlock: {
      gap: spacing.sm,
    },
    infoText: {
      color: colors.textSecondary,
    },
    captureArea: {
      gap: spacing.sm,
    },
    cameraView: {
      width: "100%",
      aspectRatio: 3 / 4,
      borderRadius: radius.md,
      overflow: "hidden",
      backgroundColor: colors.surfaceAlt,
    },
    previewImage: {
      width: "100%",
      aspectRatio: 3 / 4,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
    },
    captureActions: {
      gap: spacing.sm,
    },
    errorText: {
      color: colors.danger,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    summaryCard: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.xs,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    summaryText: {
      color: colors.textPrimary,
    },
    summaryDate: {
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
  });
}
