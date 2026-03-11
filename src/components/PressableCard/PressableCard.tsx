import { useAppTheme } from "@/src/theme/ThemeContext";
import { useRef } from "react";
import { Animated, Pressable, StyleProp, ViewStyle } from "react-native";
import { CARD_BORDER_WIDTH } from "./PressableCard.styles";

interface PressableCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  border?: boolean;
  onPress?: () => void;
}

export default function PressableCard({
  children,
  style,
  containerStyle,
  border = true,
  onPress,
}: PressableCardProps) {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const borderProgress = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
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

  const handlePressOut = () => {
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

  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
    >
      {/* Outer view: JS-driven borderColor only */}
      <Animated.View
        style={[
          style,
          { borderWidth: border ? CARD_BORDER_WIDTH : 0, borderColor },
        ]}
      >
        {/* Inner view: native-driven scale only */}
        <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
