import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { ActivityIndicator, View } from "react-native";

import { createStyles } from "./styles";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Cargando información..." }: LoadingStateProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <AppText variant="body" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}
