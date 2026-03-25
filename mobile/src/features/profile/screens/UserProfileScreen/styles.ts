import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  const avatarSize = spacing.xxl * 2;
  const avatarBorderWidth = StyleSheet.hairlineWidth * 3;
  const statDividerHeight = spacing.xl + spacing.xs;
  const statMinWidth = spacing.xxl + spacing.md;

  return StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md + spacing.xs,
    },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: radius.full,
      borderWidth: avatarBorderWidth,
      borderColor: colors.primary,
      marginBottom: spacing.sm + spacing.xs,
      backgroundColor: colors.avatarFallback,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm + spacing.xs,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm + spacing.xs,
    },
    descripcion: {
      textAlign: "center",
      marginBottom: spacing.md + spacing.xs,
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
      marginBottom: spacing.md + spacing.xs,
    },
    stat: {
      alignItems: "center",
      minWidth: statMinWidth,
    },
    statDivider: {
      width: 1,
      height: statDividerHeight,
      backgroundColor: colors.surfaceDivider,
      marginHorizontal: spacing.xs,
    },
    infoCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm + spacing.xs,
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
