import { Palette } from "@/src/constants/colors";

export const LightTheme = {
  background: Palette.grey100,
  surface: Palette.white,
  surfaceAlt: Palette.grey200,
  surfaceDivider: Palette.grey400,

  primary: Palette.green400,
  primaryLight: Palette.green400,
  primaryMuted: Palette.green500,

  textPrimary: Palette.grey900,
  textSecondary: Palette.grey500,
  textMuted: Palette.grey500,

  avatarFallback: Palette.grey600,
} as const;
