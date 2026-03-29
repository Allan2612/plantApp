import { Palette } from "@/src/constants/colors";

export const LightTheme = {
  background: Palette.pureWhite,
  surface: Palette.white,
  surfaceAlt: Palette.grey100,
  surfaceDivider: Palette.grey200,

  primary: Palette.green600,
  primaryLight: Palette.green500,
  primaryMuted: Palette.green700,

  textPrimary: Palette.dark900,
  textSecondary: Palette.grey500,
  textMuted: Palette.grey400,

  avatarFallback: Palette.grey200,

  searchBg: Palette.white,
  searchBorder: Palette.grey200,
  searchPlaceholder: Palette.grey400,

  cardOverlay: "rgba(0,0,0,0.35)",
  textOnOverlay: Palette.pureWhite,
  tabBarBg: Palette.pureWhite,
  danger: Palette.danger,
  transparent: "transparent",

  googleButtonBackground: Palette.dark700,
  googleButtonBorder: Palette.dark500,
  googleButtonText: Palette.pureWhite,
  googleIcon: Palette.green500,
} as const;
