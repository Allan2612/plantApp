import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    avatarCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + "25",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 14,
    },
    authorTextBlock: {
      flex: 1,
    },
    imageWrap: {
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor: colors.surfaceAlt,
      position: "relative",
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
    },
    toxicBadge: {
      position: "absolute",
      top: spacing.sm,
      left: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#ef4444cc",
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    toxicBadgeText: {
      fontSize: 10,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    titleBlock: {
      gap: 2,
    },
    scientificName: {
      fontStyle: "italic",
    },
    description: {
      lineHeight: 18,
    },
    nicknamesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: 2,
    },
    nicknameChip: {
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    nicknameChipText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    diffBadge: {
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderWidth: 1,
    },
    diffBadgeText: {
      fontSize: 11,
      fontWeight: "600",
    },
    climateBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    climateText: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
}
