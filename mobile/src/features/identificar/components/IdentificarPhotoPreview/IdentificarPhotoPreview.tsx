import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { DetectionResult } from "@/src/features/identificar/services/localObjectDetection.service";
import { PhotoResult } from "@/src/services/cameraService";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface IdentificarPhotoPreviewProps {
  photo: PhotoResult;
  detections: DetectionResult[];
  isDetecting: boolean;
  description: string;
  onChangeDescription: (value: string) => void;
  onRetake: () => void;
  onClear: () => void;
  onIdentify: () => void;
}

export default function IdentificarPhotoPreview({
  photo,
  detections,
  isDetecting,
  description,
  onChangeDescription,
  onRetake,
  onClear,
  onIdentify,
}: IdentificarPhotoPreviewProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
          <AppText variant="caption" style={styles.badgeText}>
            {isDetecting ? "Analizando imagen..." : "Lista para analizar"}
          </AppText>
        </View>

        <AppText variant="heading">Confirma tu foto</AppText>

        <AppText variant="body" color={colors.textSecondary} style={styles.headerSubtitle}>
          Revisa la imagen y agrega contexto. Cuanto mas detallada sea la descripcion, mejores
          seran los resultados de la IA.
        </AppText>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.uri }} style={styles.image} />

        {isDetecting ? (
          <View style={styles.imageOverlay}>
            <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
            <AppText variant="caption" style={styles.imageOverlayText}>
              Procesando...
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onRetake} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={16} color={colors.textPrimary} />
          <AppText variant="caption" style={styles.actionButtonText}>
            Tomar otra
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onClear} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <AppText variant="caption" style={[styles.actionButtonText, { color: colors.danger }]}>
            Eliminar
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputBlock}>
        <AppText variant="label">Contexto adicional</AppText>
        <AppText variant="caption" color={colors.textSecondary} style={styles.inputHelperText}>
          Describe lo que ves: color de hojas, manchas, condiciones de luz, tipo de maceta...
        </AppText>
        <TextInput
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Ej: hojas amarillas con manchas cafes, maceta en interior con poca luz..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
          style={styles.descriptionInput}
        />
      </View>

      <View style={styles.identifyBlock}>
        <AppButton
          title={isDetecting ? "Analizando imagen..." : "Analizar con IA"}
          onPress={onIdentify}
          disabled={isDetecting}
        />
        <AppText variant="caption" color={colors.textSecondary} style={styles.identifyCaption}>
          El analisis puede tardar unos segundos
        </AppText>
      </View>

      {detections.length ? (
        <View style={styles.detectionsContainer}>
          <View style={styles.detectionsHeader}>
            <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
            <AppText variant="label" color={colors.textSecondary}>
              Pre-analisis local
            </AppText>
          </View>
          {detections.map((item, index) => (
            <View key={`${item.label}-${index}`} style={styles.detectionRow}>
              <AppText variant="caption" color={colors.textSecondary} style={styles.detectionLabel}>
                {item.label}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {Math.round(item.score * 100)}%
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
