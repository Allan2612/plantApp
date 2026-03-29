import { usePressableCardLogic } from "@/src/components/shared/PressableCard/usePressableCardLogic";
import { Animated, Pressable, StyleProp, ViewStyle } from "react-native";
import {
  CARD_BORDER_WIDTH,
  createAnimatedContentStyle,
  createBorderStyle,
} from "./styles";

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
  const { scale, borderColor, onPressIn, onPressOut } = usePressableCardLogic(border);

  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
    >
      {/* Outer view: JS-driven borderColor only */}
      <Animated.View
        style={[
          style,
          createBorderStyle(border ? CARD_BORDER_WIDTH : 0, borderColor),
        ]}
      >
        {/* Inner view: native-driven scale only */}
        <Animated.View style={createAnimatedContentStyle(scale)}>
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
