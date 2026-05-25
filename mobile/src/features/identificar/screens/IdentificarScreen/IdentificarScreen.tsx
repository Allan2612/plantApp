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
    galleryThumbnailUri,
    handleTakePhoto,
    handlePickFromGallery,
    handleRetakePhoto,
    handleClearPhoto,
    handleIdentify,
    handleSavePlant,
    handleGoToGarden,
    handleNewScan,
    detections,
    isDetecting,
    aiResult,
    isIdentifying,
    isSaving,
    isSaved,
    savedPlantName,
    description,
    setDescription,
    isOffline,
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
              isOffline={isOffline}
              isSaved={isSaved}
              savedPlantName={savedPlantName}
              aiResult={aiResult}
              description={description}
              onChangeDescription={setDescription}
              onRetake={handleRetakePhoto}
              onClear={handleClearPhoto}
              onIdentify={handleIdentify}
              onSavePlant={handleSavePlant}
              onGoToGarden={handleGoToGarden}
              onNewScan={handleNewScan}
            />
          ) : (
            <IdentificarEmptyState onOpenCamera={openCamera} onPickFromGallery={handlePickFromGallery} />
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
        galleryThumbnailUri={galleryThumbnailUri}
        onClose={closeCamera}
        onTakePhoto={handleTakePhoto}
        onPickFromGallery={handlePickFromGallery}
        onToggleFacing={toggleFacing}
        onToggleFlash={toggleFlash}
      />
    </View>
  );
}
