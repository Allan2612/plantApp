import { useScrollAnim } from "@/src/context/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Animated, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../AppText/AppText";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { containerInset, createStyles } from "./AppHeader.styles";

export default function AppHeader() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { top } = useSafeAreaInsets();
  const scrollAnim = useScrollAnim();

  return (
    <Animated.View
      onLayout={(e) => scrollAnim?.setHeaderHeight(e.nativeEvent.layout.height)}
      style={[
        styles.container,
        containerInset(top),
        scrollAnim
          ? { transform: [{ translateY: scrollAnim.headerTranslateY }] }
          : undefined,
      ]}
      accessibilityRole="header"
    >
      <View style={styles.left}>
        <Image
          source={require("../../../assets/images/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="PlanTica logo"
        />
        <AppText color={colors.primary} style={styles.appName}>
          PlanTica
        </AppText>
      </View>

      <ProfileMenu />
    </Animated.View>
  );
}
