import {
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
} from "@/src/features/settings/services/settings.localData";
import { useThemeContext } from "@/src/theme/ThemeContext";

export function useSettingsScreen() {
  const { themeMode, setThemeMode } = useThemeContext();

  return {
    themeMode,
    setThemeMode,
    themeOptions: THEME_OPTIONS,
    languageOptions: LANGUAGE_OPTIONS,
  };
}
