import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { View } from "react-native";

import { createStyles } from "./styles";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <AppText variant="body" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}
