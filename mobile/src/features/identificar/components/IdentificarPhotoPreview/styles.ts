import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: spacing.md,
    },

    // Header
    header: {
      gap: spacing.sm,
    },

    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },

    badgeText: {
      color: colors.primary,
      fontWeight: "600",
    },

    headerSubtitle: {
      lineHeight: 22,
    },

    // Image
    imageContainer: {
      position: "relative",
    },

    image: {
      width: "100%",
      aspectRatio: 3 / 4,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
    },

    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radius.lg,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    imageOverlayText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },

    // Action buttons
    actionsRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      minHeight: 44,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },

    actionButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
    },

    // Description input
    inputBlock: {
      gap: spacing.xs,
    },

    inputHelperText: {
      lineHeight: 18,
    },

    descriptionInput: {
      minHeight: 100,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      color: colors.textPrimary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },

    // Identify CTA
    identifyBlock: {
      gap: spacing.xs,
    },

    identifyCaption: {
      textAlign: "center",
    },

    // Detections
    detectionsContainer: {
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },

    detectionsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },

    detectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    detectionLabel: {
      flex: 1,
      textTransform: "capitalize",
    },

    // AI result card
    aiResultCard: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary,
    },

    aiResultHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    aiResultTitleBlock: {
      flex: 1,
      gap: 2,
    },

    aiResultName: {
      color: colors.textPrimary,
    },

    aiResultScientific: {
      fontStyle: "italic",
    },

    confidenceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    confidenceBarBg: {
      flex: 1,
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceDivider,
      overflow: "hidden",
    },

    confidenceBarFill: {
      height: "100%",
      borderRadius: radius.full,
      backgroundColor: colors.primary,
    },

    confidencePct: {
      minWidth: 32,
      textAlign: "right",
      fontWeight: "600",
    },

    aiDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.surfaceDivider,
    },

    aiInfoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    aiInfoText: {
      flex: 1,
      lineHeight: 18,
    },

    // No plant state
    noPlantCard: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.danger,
      alignItems: "center",
    },

    noPlantText: {
      textAlign: "center",
      lineHeight: 18,
    },

    // Saved state
    savedContainer: {
      gap: spacing.lg,
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    savedIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    savedTitle: {
      textAlign: "center",
    },
    savedSubtitle: {
      textAlign: "center",
      lineHeight: 22,
    },
    savedActions: {
      width: "100%",
      gap: spacing.sm,
    },
    viewGardenButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      height: 50,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
    },
    viewGardenButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    newScanLink: {
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
  });
}
