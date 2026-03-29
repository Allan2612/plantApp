import { Effects } from "@/src/constants/effects";
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
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      gap: spacing.lg,
    },
    header: {
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      width: "100%",
    },
    logo: {
      width: spacing.xxl * 2,
      height: spacing.xxl * 2,
    },
    brandText: {
      fontFamily: "Caveat_700Bold",
      fontSize: spacing.xl + spacing.sm,
      lineHeight: spacing.xl + spacing.md,
    },
    titleText: {
      textAlign: "center",
    },
    subtitleText: {
      textAlign: "center",
    },
    card: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      padding: spacing.lg,
      gap: spacing.md,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: spacing.xs * 0, height: spacing.sm + spacing.xs },
      shadowOpacity: Effects.shadowOpacitySoft,
      shadowRadius: spacing.lg,
      elevation: spacing.xs,
    },
    helperBox: {
      marginTop: spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceDivider,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
  });
}
