import { Palette } from "@/src/constants/colors";

export const DarkTheme = {
  background: Palette.green900,
  surface: Palette.green700,
  surfaceAlt: Palette.green600,
  surfaceDivider: Palette.green500,

  primary: Palette.green400,
  primaryLight: Palette.green200,
  primaryMuted: Palette.green300,

  textPrimary: Palette.white,
  textSecondary: Palette.grey400,
  textMuted: Palette.green300,

  avatarFallback: Palette.grey600,
} as const;
