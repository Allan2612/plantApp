import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md + 4,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: radius.full,
      borderWidth: 3,
      borderColor: colors.primary,
      marginBottom: spacing.sm + 4,
      backgroundColor: colors.avatarFallback,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm + 4,
    },
    descripcion: {
      textAlign: "center",
      marginBottom: spacing.md + 4,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingVertical: spacing.sm + 6,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md + 4,
    },
    stat: {
      alignItems: "center",
      minWidth: 64,
    },
    statDivider: {
      width: 1,
      height: 36,
      backgroundColor: colors.surfaceDivider,
      marginHorizontal: spacing.xs,
    },
    infoCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm + 4,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    infoLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "45%",
    },
    infoValue: {
      fontWeight: "600",
      width: "55%",
      textAlign: "right",
    },
  });
}
