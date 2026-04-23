import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useCamera } from "@/src/features/identificar/hooks/useCamera";
import LocalObjectDetectionService, {
  DetectionResult,
} from "@/src/features/identificar/services/localObjectDetection.service";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { CameraView } from "expo-camera";
import { useState } from "react";
import { Image, View } from "react-native";
import { createStyles } from "./styles";

export default function IdentificarScreen() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const {
    cameraRef,
    isPermissionGranted,
    isLoadingPermissions,
    facing,
    flashMode,
    isRecording,
    isBusy,
    requestPermissions,
    takePhoto,
    startRecording,
    stopRecording,
    toggleFacing,
    toggleFlash,
    saveToGallery,
    lastPhoto,
    lastVideo,
    error,
  } = useCamera();

  const handleTakePhoto = async () => {
    const photo = await takePhoto({ quality: 0.8 });
    if (!photo) return;

    await saveToGallery(photo.uri);
    setFeedback("Foto capturada y guardada en galeria");
  };

  const handleRecordVideo = async () => {
    setFeedback("Grabando video...");

    const video = await startRecording({
      maxDuration: 10,
    });

    if (!video) return;

    await saveToGallery(video.uri);
    setFeedback("Video grabado y guardado en galeria");
  };

  const handleDetectObjects = async () => {
    if (!lastPhoto?.uri) {
      setFeedback("Primero toma una foto para analizarla");
      return;
    }

    setIsDetecting(true);
    setFeedback("Analizando imagen localmente...");

    try {
      const results = await LocalObjectDetectionService.detectFromImageUri(lastPhoto.uri);
      setDetections(results);

      if (!results.length) {
        setFeedback("No se detectaron objetos en la imagen");
        return;
      }

      setFeedback(`Se detectaron ${results.length} objeto(s)`);
    } catch {
      setDetections([]);
      setFeedback("No se pudo ejecutar la deteccion local en este dispositivo");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    await handleRecordVideo();
  };

  if (!isPermissionGranted) {
    return (
      <ScreenWrapper>
        <View style={styles.permissionContainer}>
          <AppText variant="heading">Identificar</AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
            Necesitamos permisos de camara y galeria para continuar.
          </AppText>
          <AppButton
            title={isLoadingPermissions ? "Solicitando permisos..." : "Dar permisos"}
            onPress={requestPermissions}
            disabled={isLoadingPermissions}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.cameraCard}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flashMode}
          />
        </View>

        <View style={styles.controlsRow}>
          <AppButton title="Rotar" onPress={toggleFacing} style={styles.controlButton} />
          <AppButton
            title={`Flash: ${flashMode}`}
            onPress={toggleFlash}
            style={styles.controlButton}
          />
        </View>

        <View style={styles.controlsRow}>
          <AppButton
            title={isBusy ? "Procesando..." : "Tomar foto"}
            onPress={handleTakePhoto}
            disabled={isBusy}
            style={styles.controlButton}
          />
          <AppButton
            title={isRecording ? "Detener video" : "Grabar video"}
            onPress={handleToggleRecording}
            style={styles.controlButton}
          />
        </View>

        {feedback ? (
          <AppText variant="caption" color={colors.textSecondary} style={styles.centerText}>
            {feedback}
          </AppText>
        ) : null}

        {error ? (
          <AppText variant="caption" color={colors.danger} style={styles.centerText}>
            {error}
          </AppText>
        ) : null}

        {lastPhoto ? (
          <View style={styles.previewContainer}>
            <AppText variant="label">Ultima foto</AppText>
            <Image source={{ uri: lastPhoto.uri }} style={styles.previewImage} />
            <AppButton
              title={isDetecting ? "Detectando..." : "Detectar objetos"}
              onPress={handleDetectObjects}
              disabled={isDetecting}
            />

            {detections.length ? (
              <View style={styles.detectionsContainer}>
                <AppText variant="label">Objetos detectados</AppText>
                {detections.map((item, index) => (
                  <AppText
                    key={`${item.label}-${index}`}
                    variant="caption"
                    color={colors.textSecondary}
                  >
                    {`${index + 1}. ${item.label} (${Math.round(item.score * 100)}%)`}
                  </AppText>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {lastVideo ? (
          <AppText variant="caption" color={colors.textSecondary}>
            Ultimo video: {lastVideo.uri}
          </AppText>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}
