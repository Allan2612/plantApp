// mobile/src/components/shared/PlantImagePicker/styles.ts
import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    emptyContainer: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.surfaceDivider,
      borderStyle: "dashed",
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    previewContainer: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: colors.surfaceAlt,
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    changeOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    changeText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
  });
}
