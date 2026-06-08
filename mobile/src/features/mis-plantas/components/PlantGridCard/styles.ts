import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme, cardWidth: number) {
  return StyleSheet.create({
    pressable: {
      width: cardWidth,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    highlighted: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    image: {
      width: cardWidth,
      aspectRatio: 3 / 4,
      backgroundColor: colors.surfaceAlt,
    },
    fallback: {
      width: cardWidth,
      aspectRatio: 3 / 4,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    // Pseudo-gradient: 2 layers transparent→dark (single visible transition)
    gradientWrap: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "55%",
    },
    gradientTop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.0)",
    },
    gradientBottom: {
      height: "55%",
      backgroundColor: "rgba(0,0,0,0.62)",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
      gap: spacing.xs,
    },
    nickname: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    healthLabel: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 11,
    },
    locationLabel: {
      color: "rgba(255,255,255,0.75)",
      fontSize: 10,
      flex: 1,
    },
    healthDot: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#FFFFFF",
    },
  });
}
