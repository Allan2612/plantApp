import { useAppTheme } from "@/src/theme/designSystem";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenWrapper({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      accessibilityRole="summary"
    >
      {children}
    </SafeAreaView>
  );
}
