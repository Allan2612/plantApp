import { Animated, StyleSheet, ViewStyle } from "react-native";

/** Width of the animated border shown on press. */
export const CARD_BORDER_WIDTH = StyleSheet.hairlineWidth * 2;

export function createBorderStyle(
  borderWidth: number,
  borderColor: string | Animated.AnimatedInterpolation<string | number>,
): Animated.WithAnimatedObject<ViewStyle> {
  return {
    borderWidth,
    borderColor,
  } as Animated.WithAnimatedObject<ViewStyle>;
}

export function createAnimatedContentStyle(
  scale: Animated.Value,
): Animated.WithAnimatedObject<ViewStyle> {
  return {
    flex: 1,
    transform: [{ scale }],
  } as Animated.WithAnimatedObject<ViewStyle>;
}
