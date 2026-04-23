import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, FlashMode } from "expo-camera";
import { Modal, StatusBar, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./styles";

interface IdentificarCameraProps {
  cameraRef: React.RefObject<CameraView | null>;
  facing: CameraType;
  flashMode: FlashMode;
  isBusy: boolean;
  isVisible: boolean;
  error: string | null;
  onClose: () => void;
  onTakePhoto: () => Promise<void>;
  onToggleFacing: () => void;
  onToggleFlash: () => void;
}

export default function IdentificarCamera({
  cameraRef,
  facing,
  flashMode,
  isBusy,
  isVisible,
  error,
  onClose,
  onTakePhoto,
  onToggleFacing,
  onToggleFlash,
}: IdentificarCameraProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const flashIconName =
    flashMode === "on" ? "flash" : flashMode === "auto" ? "flash-outline" : "flash-off";

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flashMode}
        />

        <View style={styles.overlay}>
          <View style={styles.topFade} />

          <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton} activeOpacity={0.85}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleFlash} style={styles.iconButton} activeOpacity={0.85}>
              <Ionicons
                name={flashIconName as "flash" | "flash-outline" | "flash-off"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.guideWrapper}>
            <View style={styles.guideOuter}>
              <View style={styles.guide}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
              </View>

              {error ? (
                <View style={styles.errorBadge}>
                  <AppText variant="caption" style={styles.errorBadgeText}>
                    {error}
                  </AppText>
                </View>
              ) : (
                <View style={styles.guideBadge}>
                  <AppText variant="caption" style={styles.guideBadgeText}>
                    Centra la planta dentro del marco
                  </AppText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.bottomFade} />

          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
            <TouchableOpacity
              onPress={onToggleFacing}
              style={styles.iconButton}
              activeOpacity={0.85}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onTakePhoto}
              style={[styles.shutterButton, isBusy && styles.shutterButtonDisabled]}
              activeOpacity={0.9}
              disabled={isBusy}
            >
              <View style={styles.shutterMiddle}>
                <View style={styles.shutterInner} />
              </View>
            </TouchableOpacity>

            <View style={styles.iconButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
