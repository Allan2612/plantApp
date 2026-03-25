import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Animated } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./styles";

interface ScreenWrapperProps {
  children: React.ReactNode | React.ReactNode[];
  edges?: Edge[];
}

export default function ScreenWrapper({
  children,
  edges = ["bottom", "left", "right"],
}: ScreenWrapperProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const scrollAnim = useScrollAnim();

  return (
    <SafeAreaView
      style={styles.container}
      edges={edges}
      accessibilityRole="summary"
    >
      <Animated.View
        style={[
          styles.container,
          {
            paddingTop:
              scrollAnim?.headerPaddingAnim ?? scrollAnim?.headerHeight ?? 0,
          },
        ]}
      >
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}
