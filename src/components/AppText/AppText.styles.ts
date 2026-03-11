import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet, TextStyle } from "react-native";

export function createStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    defaultColor: {
      color: colors.textPrimary,
    },
  });
}

export function textColor(color: string): TextStyle {
  return { color };
}
