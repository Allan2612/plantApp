import { useAppTheme } from "@/src/theme/designSystem";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./ScreenWrapper.styles";

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
  return (
    <SafeAreaView
      style={styles.container}
      edges={edges}
      accessibilityRole="summary"
    >
      {children}
    </SafeAreaView>
  );
}
