import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import IdentificarCamera from "@/src/features/identificar/components/IdentificarCamera";
import IdentificarEmptyState from "@/src/features/identificar/components/IdentificarEmptyState";
import IdentificarPermissions from "@/src/features/identificar/components/IdentificarPermissions";
import IdentificarPhotoPreview from "@/src/features/identificar/components/IdentificarPhotoPreview";
import { useIdentificarScreen } from "@/src/features/identificar/hooks/useIdentificarScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { ScrollView, View } from "react-native";
import { createStyles } from "./styles";

export default function IdentificarScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const {
    cameraRef,
    facing,
    flashMode,
    isBusy,
    isLoadingPermissions,
    cameraError,
    permissionStep,
    isCameraPermissionGranted,
    isMediaLibraryPermissionGranted,
    canAskAgainCamera,
    canAskAgainMediaLibrary,
    requestCameraPermission,
    requestMediaLibraryPermission,
    openSettings,
    toggleFacing,
    toggleFlash,
    isCameraOpen,
    openCamera,
    closeCamera,
    capturedPhoto,
    handleTakePhoto,
    handleRetakePhoto,
    handleClearPhoto,
    handleIdentify,
    handleSavePlant,
    detections,
    isDetecting,
    aiResult,
    aiImageUrl,
    isIdentifying,
    isSaving,
    description,
    setDescription,
  } = useIdentificarScreen();

  if (permissionStep !== "granted") {
    return (
      <IdentificarPermissions
        isCameraPermissionGranted={isCameraPermissionGranted}
        isMediaLibraryPermissionGranted={isMediaLibraryPermissionGranted}
        canAskAgainCamera={canAskAgainCamera}
        canAskAgainMediaLibrary={canAskAgainMediaLibrary}
        isLoadingPermissions={isLoadingPermissions}
        error={cameraError}
        onRequestCamera={requestCameraPermission}
        onRequestMediaLibrary={requestMediaLibraryPermission}
        onOpenSettings={openSettings}
      />
    );
  }

  return (
    <View style={styles.root}>
      <ScreenWrapper>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {capturedPhoto ? (
            <IdentificarPhotoPreview
              photo={capturedPhoto}
              detections={detections}
              isDetecting={isDetecting}
              isIdentifying={isIdentifying}
              isSaving={isSaving}
              aiResult={aiResult}
              aiImageUrl={aiImageUrl}
              description={description}
              onChangeDescription={setDescription}
              onRetake={handleRetakePhoto}
              onClear={handleClearPhoto}
              onIdentify={handleIdentify}
              onSavePlant={handleSavePlant}
            />
          ) : (
            <IdentificarEmptyState onOpenCamera={openCamera} />
          )}
        </ScrollView>
      </ScreenWrapper>

      <IdentificarCamera
        cameraRef={cameraRef}
        facing={facing}
        flashMode={flashMode}
        isBusy={isBusy}
        isVisible={isCameraOpen}
        error={cameraError}
        onClose={closeCamera}
        onTakePhoto={handleTakePhoto}
        onToggleFacing={toggleFacing}
        onToggleFlash={toggleFlash}
      />
    </View>
  );
}
