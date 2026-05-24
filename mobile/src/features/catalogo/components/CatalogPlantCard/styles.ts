import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    imageWrap: {
      width: 100,
      minHeight: 100,
      alignSelf: "stretch",
      backgroundColor: colors.surfaceAlt,
    },
    image: {
      width: 100,
      flex: 1,
    },
    imageFallback: {
      width: 100,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    toxicBadge: {
      position: "absolute",
      top: spacing.xs,
      left: spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: "#ef444425",
      borderWidth: 1,
      borderColor: "#ef4444",
      borderRadius: radius.full,
      paddingHorizontal: spacing.xs + 2,
      paddingVertical: 2,
    },
    toxicBadgeText: {
      fontSize: 9,
      color: "#ef4444",
      fontWeight: "700",
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
      justifyContent: "center",
    },
    scientificName: {
      fontStyle: "italic",
    },
    description: {
      lineHeight: 18,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: 2,
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
