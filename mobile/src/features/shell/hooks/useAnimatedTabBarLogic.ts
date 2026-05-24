import { useAppTheme } from "@/src/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useAnimatedTabBarLogic(_activeTabIndex: number) {
  const { colors, spacing } = useAppTheme();
  const { bottom } = useSafeAreaInsets();

  const tabBarHeight = spacing.xxl + bottom;

  const dynamicStyle = {
    backgroundColor: colors.tabBarBg,
    borderTopColor: colors.surfaceDivider,
    height: tabBarHeight,
    paddingBottom: bottom,
  };

  return {
    colors,
    dynamicStyle,
  };
}
