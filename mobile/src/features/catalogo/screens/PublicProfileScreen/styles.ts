import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    headerCard: {
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.surfaceDivider,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      alignItems: "center",
      gap: spacing.sm,
    },
    avatarCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary + "25",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 28,
    },
    displayName: {
      textAlign: "center",
    },
    username: {
      textAlign: "center",
    },
    headline: {
      textAlign: "center",
      paddingHorizontal: spacing.md,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xl,
      paddingVertical: spacing.xs,
    },
    statItem: {
      alignItems: "center",
      gap: 2,
    },
    statValue: {
      fontWeight: "700",
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    postsHeader: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.sm,
    },
    separator: {
      height: spacing.sm,
    },
    emptyBox: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
  });
}
