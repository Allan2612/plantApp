import { TextStyle } from "react-native";

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: "bold",
  } as TextStyle,
  heading: {
    fontSize: 22,
    fontWeight: "bold",
  } as TextStyle,
  subheading: {
    fontSize: 18,
    fontWeight: "600",
  } as TextStyle,
  body: {
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 12,
  } as TextStyle,
  label: {
    fontSize: 13,
  } as TextStyle,
} as const;
