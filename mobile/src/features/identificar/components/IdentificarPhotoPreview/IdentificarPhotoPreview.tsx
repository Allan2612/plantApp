import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { PlantIdentificationResult } from "@/src/features/identificar/services/aiIdentification.service";
import { DetectionResult } from "@/src/features/identificar/services/localObjectDetection.service";
import { PhotoResult } from "@/src/services/cameraService";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import SavePlantSheet from "@/src/features/identificar/components/SavePlantSheet";
import { SavePlantData } from "@/src/features/identificar/components/SavePlantSheet/SavePlantSheet";
import { createStyles } from "./styles";

interface IdentificarPhotoPreviewProps {
  photo: PhotoResult;
  detections: DetectionResult[];
  isDetecting: boolean;
  isIdentifying: boolean;
  isSaving: boolean;
  isOffline: boolean;
  isSaved: boolean;
  savedPlantName: string | null;
  aiResult: PlantIdentificationResult | null;
  description: string;
  onChangeDescription: (value: string) => void;
  onRetake: () => void;
  onClear: () => void;
  onIdentify: () => void;
  onSavePlant: (data: SavePlantData) => Promise<void>;
  onGoToGarden: () => void;
  onNewScan: () => void;
}

type ViewState = "idle" | "analyzing" | "result-plant" | "result-no-plant" | "saved";

function resolveState(
  isIdentifying: boolean,
  isDetecting: boolean,
  aiResult: PlantIdentificationResult | null,
  isSaved: boolean,
): ViewState {
  if (isSaved) return "saved";
  if (isIdentifying || isDetecting) return "analyzing";
  if (!aiResult) return "idle";
  return aiResult.isPlant ? "result-plant" : "result-no-plant";
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
  isOffline,
  isSaved,
  savedPlantName,
  aiResult,
  description,
  onChangeDescription,
  onRetake,
  onClear,
  onIdentify,
  onSavePlant,
  onGoToGarden,
  onNewScan,
}: IdentificarPhotoPreviewProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  const viewState = resolveState(isIdentifying, isDetecting, aiResult, isSaved);
  const confidencePct = aiResult ? Math.round(aiResult.confidence * 100) : 0;

  if (viewState === "saved") {
    return (
      <View style={styles.container}>
        <View style={styles.savedContainer}>
          <View style={styles.savedIconCircle}>
            <Ionicons name="checkmark" size={40} color={colors.primary} />
          </View>
          <AppText variant="heading" style={styles.savedTitle}>
            ¡Planta agregada!
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.savedSubtitle}>
            {savedPlantName ?? "Tu planta"} fue guardada en tu jardín.
          </AppText>
          <View style={styles.savedActions}>
            <TouchableOpacity style={styles.viewGardenButton} onPress={onGoToGarden} activeOpacity={0.85}>
              <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
              <AppText variant="label" style={styles.viewGardenButtonText}>
                Ver en mi jardín
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.newScanLink} onPress={onNewScan} activeOpacity={0.7}>
              <AppText variant="caption" color={colors.primary}>
                Identificar otra planta
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
          <AppText variant="caption" style={styles.badgeText}>
            {viewState === "analyzing"
              ? isIdentifying
                ? "Identificando con IA..."
                : "Pre-analizando imagen..."
              : viewState === "result-plant" || viewState === "result-no-plant"
              ? "Análisis completado"
              : "Lista para analizar"}
          </AppText>
        </View>

        <AppText variant="heading">
          {viewState === "analyzing" ? "Analizando..." : "Confirma tu foto"}
        </AppText>

        {viewState === "idle" ? (
          <AppText variant="body" color={colors.textSecondary} style={styles.headerSubtitle}>
            Revisa la imagen y agrega contexto para mejores resultados.
          </AppText>
        ) : null}
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.uri }} style={styles.image} />

        {viewState === "analyzing" ? (
          <View style={styles.imageOverlay}>
            <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
            <AppText variant="caption" style={styles.imageOverlayText}>
              {isIdentifying ? "Identificando..." : "Procesando..."}
            </AppText>
          </View>
        ) : null}
      </View>

      {viewState !== "analyzing" ? (
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
      ) : null}

      {viewState === "idle" ? (
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
              title={isOffline ? "Sin conexión" : "Analizar con IA"}
              onPress={onIdentify}
              disabled={isOffline}
            />
            <AppText variant="caption" color={colors.textSecondary} style={styles.identifyCaption}>
              {isOffline ? "Conéctate a internet para identificar la planta" : "El análisis puede tardar unos segundos"}
            </AppText>
          </View>

          {detections.length > 0 ? (
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
      ) : null}

      {viewState === "result-plant" && aiResult ? (
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

          {aiResult.nicknames.length > 0 ? (
            <View style={styles.nicknamesBlock}>
              <AppText variant="caption" color={colors.textMuted} style={styles.nicknamesLabel}>
                También conocida como
              </AppText>
              <View style={styles.nicknamesRow}>
                {aiResult.nicknames.map((nickname) => (
                  <View key={nickname} style={styles.nicknameChip}>
                    <AppText style={styles.nicknameChipText}>{nickname}</AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

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
            title={isOffline ? "Sin conexión" : "Guardar en Mi Jardín"}
            onPress={() => setShowSaveSheet(true)}
            disabled={isOffline}
          />
        </View>
      ) : null}

      {viewState === "result-no-plant" ? (
        <View style={styles.noPlantCard}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
          <AppText variant="label" color={colors.danger}>
            No se detectó una planta
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.noPlantText}>
            Intenta con una foto más clara, mejor iluminada y con la planta como tema principal.
          </AppText>
        </View>
      ) : null}

      {aiResult?.isPlant && showSaveSheet ? (
        <SavePlantSheet
          visible={showSaveSheet}
          aiResult={aiResult}
          capturedPhotoUri={photo.uri}
          isSaving={isSaving}
          isOffline={isOffline}
          onSave={async (data) => {
            await onSavePlant(data);
            setShowSaveSheet(false);
          }}
          onClose={() => setShowSaveSheet(false)}
        />
      ) : null}
    </View>
  );
}
