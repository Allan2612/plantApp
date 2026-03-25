import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      gap: spacing.lg,
    },
    header: {
      gap: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.surfaceDivider,
      padding: spacing.lg,
      gap: spacing.md,
    },
  });
}
