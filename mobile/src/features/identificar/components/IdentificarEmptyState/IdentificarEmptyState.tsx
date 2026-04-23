import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { createStyles } from "./styles";

interface IdentificarEmptyStateProps {
  onOpenCamera: () => void;
}

export default function IdentificarEmptyState({ onOpenCamera }: IdentificarEmptyStateProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Ionicons name="leaf-outline" size={56} color={colors.primary} />
      <AppText variant="heading" style={styles.centerText}>
        Sin foto todavia
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.centerText}>
        Abre la camara y centra la planta dentro del marco para tomar la foto.
      </AppText>
      <AppButton title="Abrir camara" onPress={onOpenCamera} />
    </View>
  );
}
