import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./ScreenWrapper.styles";

export default function ScreenWrapper({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}
