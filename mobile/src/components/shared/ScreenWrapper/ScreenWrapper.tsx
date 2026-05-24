import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { StyleProp, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./styles";

interface ScreenWrapperProps {
  children: React.ReactNode | React.ReactNode[];
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function ScreenWrapper({
  children,
  edges = ["bottom", "left", "right"],
  contentContainerStyle,
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
      <View
        style={[
          styles.container,
          { paddingTop: scrollAnim?.headerHeight ?? 90 },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
