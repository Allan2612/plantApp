import { AppTheme } from "@/src/theme/designSystem";
import { Dimensions, StyleSheet } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function createStyles({ colors, spacing, radius, typography }: AppTheme) {
  const cardWidth = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2;

  return StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    headerRow: {
      width: "100%",
      gap: spacing.sm,
    },
    titleBlock: {
      gap: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
    },
    errorCard: {
      width: "100%",
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
    },
    errorCardText: {
      ...typography.body,
      color: colors.danger,
    },
    summaryRow: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.xs,
    },
    summaryCard: {
      flex: 1,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      gap: spacing.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
    },
    summaryValue: {
      textAlign: "center",
    },
    formCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      padding: spacing.md,
      gap: spacing.md,
    },
    fieldBlock: {
      width: "100%",
      gap: spacing.xs,
    },
    fieldLabel: {
      ...typography.label,
      color: colors.textSecondary,
    },
    favoriteToggle: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    favoriteToggleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    favoriteText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    dateSelector: {
      width: "100%",
      minHeight: spacing.xl + spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg,
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
    previewWrap: {
      width: "100%",
      borderRadius: radius.md,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
    },
    previewImage: {
      width: "100%",
      height: spacing.xxl + spacing.xxl,
    },
    gallerySection: {
      width: "100%",
      gap: spacing.sm,
    },
    listHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.xs,
    },
    refreshText: {
      ...typography.caption,
      color: colors.primary,
    },
    galleryGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    galleryCard: {
      width: cardWidth,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    imageFrame: {
      width: "100%",
      height: cardWidth,
      backgroundColor: colors.surfaceAlt,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    imageFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    cardBody: {
      width: "100%",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      gap: spacing.xs,
    },
    healthBadge: {
      ...typography.caption,
      color: colors.primary,
    },
    metaText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    editHeaderRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.xs,
    },
    closeEditText: {
      ...typography.caption,
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.cardOverlay,
      justifyContent: "flex-end",
    },
    modalCard: {
      width: "100%",
      maxHeight: "86%",
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
    modalScroll: {
      width: "100%",
    },
    modalContent: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
  });
}
