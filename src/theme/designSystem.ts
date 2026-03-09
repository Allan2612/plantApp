import { Spacing } from "../constants/spacing";
import { Typography } from "../constants/typography";
import { DarkTheme } from "./dark";
import { LightTheme } from "./light";
import { useThemeContext } from "./ThemeContext";

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export function getAppTheme(colorScheme: "light" | "dark") {
  const colors = colorScheme === "light" ? LightTheme : DarkTheme;
  return { colors, spacing: Spacing, typography: Typography, radius: Radius };
}

export function useAppTheme() {
  return useThemeContext().theme;
}

export type AppTheme = ReturnType<typeof getAppTheme>;
