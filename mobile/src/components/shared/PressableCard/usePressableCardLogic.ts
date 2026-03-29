import { useAppTheme } from "@/src/theme/ThemeContext";
import { useRef } from "react";
import { Animated } from "react-native";

export function usePressableCardLogic(border: boolean) {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const borderProgress = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.07,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(borderProgress, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }),
      Animated.timing(borderProgress, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = borderProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", border ? colors.primary : "transparent"],
  });

  return {
    scale,
    borderColor,
    onPressIn,
    onPressOut,
  };
}
