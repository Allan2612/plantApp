import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius, typography }: AppTheme) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      width: "100%",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    headerRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    headerIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    headerAvatarBox: {
      width: spacing.xl + spacing.lg,
      height: spacing.xl + spacing.lg,
      borderRadius: radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    headerAvatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: radius.full,
    },
    titleBlock: {
      flex: 1,
      gap: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
    },
    summaryCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    summaryHero: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    avatarBox: {
      width: spacing.xxl + spacing.lg,
      height: spacing.xxl + spacing.lg,
      borderRadius: radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: radius.full,
    },
    summaryTopRow: {
      flex: 1,
      gap: spacing.xs,
    },
    userHandle: {
      ...typography.caption,
      color: colors.primary,
    },
    emailText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    headlineText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    infoGrid: {
      width: "100%",
      gap: spacing.sm,
    },
    infoItem: {
      width: "100%",
      gap: spacing.xs,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    infoLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },
    formCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    fieldBlock: {
      width: "100%",
      gap: spacing.xs,
    },
    fieldLabel: {
      ...typography.label,
      color: colors.textSecondary,
    },
    dateSelector: {
      width: "100%",
      minHeight: spacing.xl + spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg + spacing.xs,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    dateSelectorText: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
    },
    clearDateAction: {
      alignSelf: "flex-start",
      marginTop: spacing.xs,
      paddingVertical: spacing.xs * 0,
      paddingHorizontal: spacing.xs * 0,
      backgroundColor: colors.transparent,
    },
    clearDateText: {
      ...typography.caption,
      color: colors.primary,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
    previewRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
    },
    previewAvatar: {
      width: spacing.xl,
      height: spacing.xl,
      borderRadius: radius.full,
    },
    previewText: {
      ...typography.caption,
      color: colors.textSecondary,
      flex: 1,
    },
  });
}
