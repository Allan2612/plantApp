import { Ionicons } from "@expo/vector-icons";

export type ThemeOption = {
  label: string;
  value: "system" | "light" | "dark";
  icon: keyof typeof Ionicons.glyphMap;
};

export const THEME_OPTIONS: ThemeOption[] = [
  { label: "Sistema", value: "system", icon: "phone-portrait-outline" },
  { label: "Claro", value: "light", icon: "sunny-outline" },
  { label: "Oscuro", value: "dark", icon: "moon-outline" },
];

export const LANGUAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "Español", value: "es" },
  { label: "English", value: "en" },
];
