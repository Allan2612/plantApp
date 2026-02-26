import { DarkTheme } from "./dark";
import { LightTheme } from "./light";

export type Theme = typeof DarkTheme;

// Cambia a LightTheme para el tema claro
export const Colors: Theme = DarkTheme;

export { DarkTheme, LightTheme };

