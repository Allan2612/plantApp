import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { createStyles } from "./styles";

interface IdentificarPermissionsProps {
  isCameraPermissionGranted: boolean;
  isMediaLibraryPermissionGranted: boolean;
  isLoadingPermissions: boolean;
  error: string | null;
  onRequestCamera: () => Promise<void>;
  onRequestMediaLibrary: () => Promise<void>;
}

export default function IdentificarPermissions({
  isCameraPermissionGranted,
  isMediaLibraryPermissionGranted,
  isLoadingPermissions,
  error,
  onRequestCamera,
  onRequestMediaLibrary,
}: IdentificarPermissionsProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <AppText variant="heading" style={styles.centerText}>
          Permisos necesarios
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
          Para identificar plantas necesitamos acceso a los siguientes recursos del dispositivo.
        </AppText>

        <View style={styles.permissionCard}>
          <View style={styles.permissionCardHeader}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <AppText variant="label" style={styles.permissionCardTitle}>
              Camara
            </AppText>
            {isCameraPermissionGranted ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : null}
          </View>
          <AppText variant="caption" color={colors.textSecondary}>
            Tomar fotos de tus plantas directamente desde la app.
          </AppText>
          {!isCameraPermissionGranted ? (
            <AppButton
              title={isLoadingPermissions ? "Solicitando..." : "Permitir acceso"}
              onPress={onRequestCamera}
              disabled={isLoadingPermissions}
              variant="secondary"
            />
          ) : null}
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionCardHeader}>
            <Ionicons name="images-outline" size={24} color={colors.primary} />
            <AppText variant="label" style={styles.permissionCardTitle}>
              Galeria
            </AppText>
            {isMediaLibraryPermissionGranted ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            ) : null}
          </View>
          <AppText variant="caption" color={colors.textSecondary}>
            Guardar las fotos capturadas durante la identificacion.
          </AppText>
          {!isMediaLibraryPermissionGranted ? (
            <AppButton
              title={isLoadingPermissions ? "Solicitando..." : "Permitir acceso"}
              onPress={onRequestMediaLibrary}
              disabled={isLoadingPermissions || !isCameraPermissionGranted}
              variant="secondary"
            />
          ) : null}
        </View>

        {error ? (
          <AppText variant="caption" color={colors.danger} style={styles.centerText}>
            {error}
          </AppText>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}
