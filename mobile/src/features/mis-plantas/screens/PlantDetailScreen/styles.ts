import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    // Hero: fixed height so any image ratio looks good
    heroWrap: {
      width: "100%",
      height: 320,
      backgroundColor: colors.surfaceAlt,
    },
    hero: {
      width: "100%",
      height: 320,
    },
    heroFallback: {
      width: "100%",
      height: 320,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    backButton: {
      position: "absolute",
      top: spacing.md,
      left: spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    // Sheet overlapping the hero
    sheet: {
      marginTop: -spacing.lg,
      borderTopLeftRadius: radius.lg * 1.5,
      borderTopRightRadius: radius.lg * 1.5,
      backgroundColor: colors.background,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
    },
    // Title block
    titleBlock: {
      gap: spacing.xs,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    titleName: {
      flex: 1,
    },
    scientificName: {
      fontStyle: "italic",
    },
    healthBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      alignSelf: "flex-start",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      borderWidth: 1,
      marginTop: 2,
    },
    // Quick stats chips row
    quickStatsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    statChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    statChipText: {
      color: colors.textSecondary,
    },
    // Section cards
    sectionCard: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
    },
    sectionTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingBottom: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.surfaceDivider,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    infoText: {
      flex: 1,
      lineHeight: 20,
    },
    fab: {
      position: "absolute",
      bottom: spacing.xxl + spacing.xxl + spacing.md,
      right: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    rulesButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.primary,
      marginTop: spacing.sm,
    },
    // Not found
    notFoundContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
      padding: spacing.xl,
    },
  });
}
