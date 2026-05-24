import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface IdentificarEmptyStateProps {
  onOpenCamera: () => void;
  onPickFromGallery: () => void;
}

export default function IdentificarEmptyState({ onOpenCamera, onPickFromGallery }: IdentificarEmptyStateProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconStack}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={48} color={colors.primary} />
        </View>
        <View style={styles.cameraChip}>
          <Ionicons name="camera" size={18} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <AppText variant="heading" style={styles.centerText}>
          Identifica tu planta
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
          Usa IA para reconocer cualquier planta y agregarla a tu jardín automáticamente.
        </AppText>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onOpenCamera} activeOpacity={0.85}>
        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        <AppText variant="label" style={styles.primaryButtonText}>
          Tomar foto
        </AppText>
      </TouchableOpacity>

      <Pressable onPress={onPickFromGallery} style={styles.secondaryLink}>
        <AppText variant="caption" color={colors.primary}>
          Elegir de galería
        </AppText>
      </Pressable>
    </View>
  );
}
