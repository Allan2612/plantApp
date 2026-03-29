import { useAnimatedTabBarLogic } from "@/src/features/shell/hooks/useAnimatedTabBarLogic";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Animated, Pressable } from "react-native";
import { styles } from "./styles";

export default function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors, scrollAnim, dynamicStyle, translateStyle } =
    useAnimatedTabBarLogic(state.index);

  return (
    <Animated.View
      onLayout={(e) => scrollAnim?.setTabBarHeight(e.nativeEvent.layout.height)}
      style={[
        styles.container,
        dynamicStyle,
        translateStyle,
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        // Skip tabs flagged as hidden (href: null in expo-router)
        if (!options.tabBarIcon) return null;

        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            onPress={onPress}
            style={styles.tab}
          >
            {options.tabBarIcon({ color, focused: isFocused, size: 24 })}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}
