import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

const AVATAR_SIZE = 100;
const AVATAR_BORDER_WIDTH = 3;
const STAT_DIVIDER_HEIGHT = 36;
const STAT_MIN_WIDTH = 64;

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md + 4,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: radius.full,
      borderWidth: AVATAR_BORDER_WIDTH,
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
      minWidth: STAT_MIN_WIDTH,
    },
    statDivider: {
      width: 1,
      height: STAT_DIVIDER_HEIGHT,
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
    apodo: {
      marginBottom: spacing.sm,
    },
    badgeIcon: {
      marginRight: spacing.xs,
    },
    infoIcon: {
      marginRight: spacing.xs + 2,
    },
  });
}
