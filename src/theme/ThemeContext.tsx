import { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { getAppTheme, AppTheme } from "./designSystem";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  const resolvedScheme =
    themeMode === "system" ? (systemScheme ?? "dark") : themeMode;

  const theme = useMemo(() => getAppTheme(resolvedScheme), [resolvedScheme]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be inside ThemeProvider");
  return ctx;
}
