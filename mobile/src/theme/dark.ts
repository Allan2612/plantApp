import { Palette } from "@/src/constants/colors";

export const DarkTheme = {
  background: Palette.black,
  surface: Palette.dark800,
  surfaceAlt: Palette.dark600,
  surfaceDivider: Palette.dark500,

  primary: Palette.green500,
  primaryLight: Palette.green400,
  primaryMuted: Palette.green700,

  textPrimary: Palette.white,
  textSecondary: Palette.grey500,
  textMuted: Palette.grey600,

  avatarFallback: Palette.dark600,

  searchBg: Palette.dark700,
  searchBorder: Palette.dark500,
  searchPlaceholder: Palette.grey500,

  cardOverlay: "rgba(0,0,0,0.45)",
  textOnOverlay: Palette.pureWhite,
  tabBarBg: Palette.dark900,
  danger: Palette.danger,
  transparent: "transparent",

  googleButtonBackground: Palette.dark700,
  googleButtonBorder: Palette.dark500,
  googleButtonText: Palette.pureWhite,
  googleIcon: Palette.green400,
} as const;
