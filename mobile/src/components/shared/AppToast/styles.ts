import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ spacing, radius }: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      position: "absolute",
      top: spacing.lg,
      left: spacing.md,
      right: spacing.md,
      zIndex: 1000,
    },
    toast: {
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
  });
}
