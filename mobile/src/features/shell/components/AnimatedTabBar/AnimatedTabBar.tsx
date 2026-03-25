import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

export default function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors, spacing } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const scrollAnim = useScrollAnim();
  const prevTabIndex = useRef(state.index);

  // Reset header/tab bar visibility on tab switch
  useEffect(() => {
    if (prevTabIndex.current !== state.index) {
      prevTabIndex.current = state.index;
      scrollAnim?.resetScrollAnim();
    }
  }, [state.index, scrollAnim]);

  const tabBarHeight = spacing.xxl + bottom;

  return (
    <Animated.View
      onLayout={(e) => scrollAnim?.setTabBarHeight(e.nativeEvent.layout.height)}
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.surfaceDivider,
          height: tabBarHeight,
          paddingBottom: bottom,
        },
        scrollAnim
          ? { transform: [{ translateY: scrollAnim.tabBarTranslateY }] }
          : undefined,
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
