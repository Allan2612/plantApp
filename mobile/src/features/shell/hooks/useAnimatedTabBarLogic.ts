import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useAnimatedTabBarLogic(activeTabIndex: number) {
  const { colors, spacing } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const scrollAnim = useScrollAnim();
  const prevTabIndex = useRef(activeTabIndex);

  useEffect(() => {
    if (prevTabIndex.current !== activeTabIndex) {
      prevTabIndex.current = activeTabIndex;
      scrollAnim?.resetScrollAnim();
    }
  }, [activeTabIndex, scrollAnim]);

  const tabBarHeight = spacing.xxl + bottom;

  const dynamicStyle: Animated.WithAnimatedValue<Record<string, unknown>> = {
    backgroundColor: colors.tabBarBg,
    borderTopColor: colors.surfaceDivider,
    height: tabBarHeight,
    paddingBottom: bottom,
  };

  const translateStyle = scrollAnim
    ? { transform: [{ translateY: scrollAnim.tabBarTranslateY }] }
    : undefined;

  return {
    colors,
    scrollAnim,
    dynamicStyle,
    translateStyle,
  };
}
