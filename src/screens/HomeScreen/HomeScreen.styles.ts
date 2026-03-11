import { Spacing } from "@/src/constants/spacing";
import { AppTheme } from "@/src/theme/designSystem";
import { Dimensions, StyleSheet } from "react-native";

const CARD_WIDTH = (Dimensions.get("window").width - Spacing.xxl) / 2;
const SEARCH_BAR_HEIGHT = 42;
const PLANT_ROW_IMAGE_SIZE = 80;
const MICRO_SPACE = 2;

export function createStyles({ colors, spacing, radius }: AppTheme) {
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
      height: SEARCH_BAR_HEIGHT,
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
      paddingVertical: spacing.md + 4,
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
      paddingHorizontal: spacing.sm + 4,
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
      width: PLANT_ROW_IMAGE_SIZE,
      height: PLANT_ROW_IMAGE_SIZE,
    },
    plantRowContent: {
      flex: 1,
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.sm,
      gap: MICRO_SPACE,
    },
    plantCategory: {
      marginTop: MICRO_SPACE,
    },
    plantsSectionHeader: {
      marginTop: spacing.lg,
    },
    chevronIcon: {
      marginRight: spacing.sm + 4,
    },
  });
}
