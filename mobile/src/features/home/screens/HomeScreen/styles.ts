import { AppTheme } from "@/src/theme/designSystem";
import { Dimensions, StyleSheet } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
export function createStyles({ colors, spacing, radius }: AppTheme) {
  const searchBarHeight = spacing.xl + spacing.sm + spacing.xs / 2;
  const plantRowImageSize = spacing.xl * 2 + spacing.md;
  const microSpace = spacing.xs / 2;
  const CARD_WIDTH = (SCREEN_WIDTH - spacing.xxl) / 2;
  return StyleSheet.create({
    scroll: {
      paddingBottom: spacing.xxl,
    },
    searchContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.searchBg,
      borderRadius: radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.searchBorder,
      paddingHorizontal: spacing.md,
      height: searchBarHeight,
      gap: spacing.sm,
    },
    searchPlaceholder: {
      flex: 1,
    },
    actionsRow: {
      flexDirection: "row",
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    actionCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    actionCardInner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md + spacing.xs,
      gap: spacing.sm,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    trendingRow: {
      paddingLeft: spacing.md,
      gap: spacing.sm,
    },
    trendingCardWrapper: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.2,
      borderRadius: radius.lg,
    },
    trendingCard: {
      flex: 1,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    trendingImage: {
      width: "100%",
      height: "100%",
    },
    trendingOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.sm + spacing.xs,
      paddingVertical: spacing.sm,
      backgroundColor: colors.cardOverlay,
    },
    plantsList: {
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    plantCardOuter: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    plantRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    plantRowImage: {
      width: plantRowImageSize,
      height: plantRowImageSize,
    },
    plantRowContent: {
      flex: 1,
      paddingHorizontal: spacing.sm + spacing.xs,
      paddingVertical: spacing.sm,
      gap: microSpace,
    },
    plantCategory: {
      marginTop: microSpace,
    },
    plantsSectionHeader: {
      marginTop: spacing.lg,
    },
    chevronIcon: {
      marginRight: spacing.sm + spacing.xs,
    },
    catalogRow: {
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    catalogCard: {
      width: CARD_WIDTH * 0.85,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    catalogImage: {
      width: "100%",
      height: CARD_WIDTH * 0.7,
    },
    catalogContent: {
      padding: spacing.sm + spacing.xs,
      gap: microSpace,
    },
    catalogDifficulty: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
  });
}
