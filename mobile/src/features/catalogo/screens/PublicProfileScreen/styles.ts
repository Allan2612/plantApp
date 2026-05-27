import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    navBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.surfaceDivider,
      backgroundColor: colors.background,
    },
    navBackBtn: {
      padding: spacing.sm,
    },
    navTitle: {
      flex: 1,
      marginLeft: spacing.xs,
    },
    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    // Profile header
    profileHeader: {
      backgroundColor: colors.background,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      gap: spacing.xs,
      borderBottomWidth: 0,
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.primary + "40",
      marginBottom: spacing.xs,
    },
    avatarText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 32,
    },
    displayName: {
      textAlign: "center",
    },
    username: {
      textAlign: "center",
      marginTop: 1,
    },
    headline: {
      textAlign: "center",
      paddingHorizontal: spacing.md,
      marginTop: spacing.xs,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    // Stats bar
    statsBar: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      overflow: "hidden",
      alignSelf: "stretch",
      marginHorizontal: spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: spacing.sm,
      gap: 2,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: "stretch",
      backgroundColor: colors.surfaceDivider,
    },
    statValue: {
      fontWeight: "700",
    },
    // Posts section
    sectionHeader: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl,
    },
    separator: {
      height: spacing.sm,
    },
    emptyBox: {
      alignItems: "center",
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
  });
}
