import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { PlantIdentificationResult } from "@/src/features/identificar/services/aiIdentification.service";
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
  isIdentifying: boolean;
  isSaving: boolean;
  aiResult: PlantIdentificationResult | null;
  description: string;
  onChangeDescription: (value: string) => void;
  onRetake: () => void;
  onClear: () => void;
  onIdentify: () => void;
  onSavePlant: () => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

export default function IdentificarPhotoPreview({
  photo,
  detections,
  isDetecting,
  isIdentifying,
  isSaving,
  aiResult,
  description,
  onChangeDescription,
  onRetake,
  onClear,
  onIdentify,
  onSavePlant,
}: IdentificarPhotoPreviewProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  const isBusy = isDetecting || isIdentifying;
  const confidencePct = aiResult ? Math.round(aiResult.confidence * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
          <AppText variant="caption" style={styles.badgeText}>
            {isIdentifying
              ? "Identificando con IA..."
              : isDetecting
                ? "Pre-analizando imagen..."
                : aiResult
                  ? "Análisis completado"
                  : "Lista para analizar"}
          </AppText>
        </View>

        <AppText variant="heading">Confirma tu foto</AppText>

        <AppText variant="body" color={colors.textSecondary} style={styles.headerSubtitle}>
          Revisa la imagen y agrega contexto para mejores resultados.
        </AppText>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.uri }} style={styles.image} />

        {isBusy ? (
          <View style={styles.imageOverlay}>
            <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
            <AppText variant="caption" style={styles.imageOverlayText}>
              {isIdentifying ? "Identificando..." : "Procesando..."}
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

      {/* AI result card */}
      {aiResult ? (
        aiResult.isPlant ? (
          <View style={styles.aiResultCard}>
            <View style={styles.aiResultHeader}>
              <Ionicons name="leaf" size={18} color={colors.primary} />
              <View style={styles.aiResultTitleBlock}>
                <AppText variant="subheading" style={styles.aiResultName}>
                  {aiResult.commonName}
                </AppText>
                {aiResult.scientificName ? (
                  <AppText variant="caption" color={colors.textSecondary} style={styles.aiResultScientific}>
                    {aiResult.scientificName}
                  </AppText>
                ) : null}
              </View>
            </View>

            {/* Confidence bar */}
            <View style={styles.confidenceRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Confianza
              </AppText>
              <View style={styles.confidenceBarBg}>
                <View style={[styles.confidenceBarFill, { width: `${confidencePct}%` as `${number}%` }]} />
              </View>
              <AppText variant="caption" color={colors.primary} style={styles.confidencePct}>
                {confidencePct}%
              </AppText>
            </View>

            <View style={styles.aiDivider} />

            {/* Care info rows */}
            {aiResult.wateringNotes ? (
              <View style={styles.aiInfoRow}>
                <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.aiInfoText}>
                  {aiResult.wateringNotes}
                </AppText>
              </View>
            ) : null}

            {aiResult.lightNotes ? (
              <View style={styles.aiInfoRow}>
                <Ionicons name="sunny-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.aiInfoText}>
                  {aiResult.lightNotes}
                </AppText>
              </View>
            ) : null}

            {aiResult.difficulty ? (
              <View style={styles.aiInfoRow}>
                <Ionicons name="bar-chart-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.aiInfoText}>
                  Dificultad: {DIFFICULTY_LABEL[aiResult.difficulty] ?? aiResult.difficulty}
                </AppText>
              </View>
            ) : null}

            {aiResult.isToxic !== null ? (
              <View style={styles.aiInfoRow}>
                <Ionicons
                  name={aiResult.isToxic ? "warning-outline" : "checkmark-circle-outline"}
                  size={14}
                  color={aiResult.isToxic ? colors.danger : colors.primary}
                />
                <AppText
                  variant="caption"
                  color={aiResult.isToxic ? colors.danger : colors.primary}
                  style={styles.aiInfoText}
                >
                  {aiResult.isToxic ? "Tóxica para mascotas/personas" : "No tóxica"}
                </AppText>
              </View>
            ) : null}

            <View style={styles.aiDivider} />

            <AppButton
              title={isSaving ? "Guardando..." : "Guardar en Mis Plantas"}
              onPress={onSavePlant}
              disabled={isSaving}
            />
          </View>
        ) : (
          <View style={styles.noPlantCard}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
            <AppText variant="label" color={colors.danger}>
              No se detectó una planta
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={styles.noPlantText}>
              Intenta con una foto más clara, mejor iluminada y con la planta como tema principal.
            </AppText>
          </View>
        )
      ) : (
        <>
          <View style={styles.inputBlock}>
            <AppText variant="label">Contexto adicional</AppText>
            <AppText variant="caption" color={colors.textSecondary} style={styles.inputHelperText}>
              Describe lo que ves: color de hojas, manchas, condiciones de luz...
            </AppText>
            <TextInput
              value={description}
              onChangeText={onChangeDescription}
              placeholder="Ej: hojas amarillas con manchas cafes, poca luz..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
          </View>

          <View style={styles.identifyBlock}>
            <AppButton
              title={isBusy ? "Procesando imagen..." : "Analizar con IA"}
              onPress={onIdentify}
              disabled={isBusy}
            />
            <AppText variant="caption" color={colors.textSecondary} style={styles.identifyCaption}>
              El análisis puede tardar unos segundos
            </AppText>
          </View>

          {detections.length ? (
            <View style={styles.detectionsContainer}>
              <View style={styles.detectionsHeader}>
                <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                <AppText variant="label" color={colors.textSecondary}>
                  Pre-análisis local
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
        </>
      )}
    </View>
  );
}
