import { useAnimatedTabBarLogic } from "@/src/features/shell/hooks/useAnimatedTabBarLogic";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, View } from "react-native";
import { styles } from "./styles";

export default function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors, dynamicStyle } = useAnimatedTabBarLogic(state.index);

  return (
    <View style={[styles.container, dynamicStyle]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

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
    </View>
  );
}
