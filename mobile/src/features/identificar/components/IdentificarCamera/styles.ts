import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
    },

    camera: {
      ...StyleSheet.absoluteFillObject,
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
    },

    topFade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 180,
      backgroundColor: "rgba(0,0,0,0.28)",
    },

    bottomFade: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 260,
      backgroundColor: "rgba(0,0,0,0.34)",
    },

    topBar: {
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },

    guideWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },

    guideOuter: {
      width: "100%",
      alignItems: "center",
      gap: spacing.md,
    },

    guide: {
      width: "100%",
      maxWidth: 320,
      aspectRatio: 0.78,
      borderRadius: 30,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },

    cornerTopLeft: {
      position: "absolute",
      top: 18,
      left: 18,
      width: 42,
      height: 42,
      borderTopWidth: 5,
      borderLeftWidth: 5,
      borderColor: "#FFFFFF",
      borderTopLeftRadius: 14,
    },

    cornerTopRight: {
      position: "absolute",
      top: 18,
      right: 18,
      width: 42,
      height: 42,
      borderTopWidth: 5,
      borderRightWidth: 5,
      borderColor: "#FFFFFF",
      borderTopRightRadius: 14,
    },

    cornerBottomLeft: {
      position: "absolute",
      bottom: 18,
      left: 18,
      width: 42,
      height: 42,
      borderBottomWidth: 5,
      borderLeftWidth: 5,
      borderColor: "#FFFFFF",
      borderBottomLeftRadius: 14,
    },

    cornerBottomRight: {
      position: "absolute",
      bottom: 18,
      right: 18,
      width: 42,
      height: 42,
      borderBottomWidth: 5,
      borderRightWidth: 5,
      borderColor: "#FFFFFF",
      borderBottomRightRadius: 14,
    },

    guideBadge: {
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },

    guideBadgeText: {
      color: "#FFFFFF",
      fontWeight: "600",
      textAlign: "center",
    },

    errorBadge: {
      backgroundColor: "rgba(180,0,0,0.75)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
    },

    errorBadgeText: {
      color: "#FFFFFF",
      fontWeight: "600",
      textAlign: "center",
    },

    bottomBar: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    shutterButton: {
      width: 88,
      height: 88,
      borderRadius: 999,
      borderWidth: 4,
      borderColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.10)",
    },

    shutterButtonDisabled: {
      opacity: 0.6,
    },

    shutterMiddle: {
      width: 70,
      height: 70,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },

    shutterInner: {
      width: 58,
      height: 58,
      borderRadius: 999,
      backgroundColor: "#FFFFFF",
    },

    galleryThumb: {
      width: 46,
      height: 46,
      borderRadius: 8,
    },
  });
}
