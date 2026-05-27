import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { PlantIdentificationResult } from "@/src/features/identificar/services/aiIdentification.service";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  Switch,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { createStyles } from "./styles";

export interface SavePlantData {
  nickname: string;
  locationHome?: string;
  publishToCatalog: boolean;
}

interface SavePlantSheetProps {
  visible: boolean;
  aiResult: PlantIdentificationResult;
  capturedPhotoUri: string;
  isSaving: boolean;
  isOffline: boolean;
  onSave: (data: SavePlantData) => Promise<void>;
  onClose: () => void;
}

export default function SavePlantSheet({
  visible,
  aiResult,
  capturedPhotoUri,
  isSaving,
  isOffline,
  onSave,
  onClose,
}: SavePlantSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const locationRef = useRef<TextInput>(null);

  const [nickname, setNickname] = useState(aiResult.commonName ?? "");
  const [locationHome, setLocationHome] = useState("");
  const [publishToCatalog, setPublishToCatalog] = useState(true);

  useEffect(() => {
    if (visible) {
      setNickname(aiResult.commonName ?? "");
      setLocationHome("");
      setPublishToCatalog(true);
    }
  }, [visible, aiResult.commonName]);

  const handleSave = async () => {
    if (!nickname.trim()) return;
    try {
      await onSave({ nickname: nickname.trim(), locationHome: locationHome.trim() || undefined, publishToCatalog });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar la planta.";
      Alert.alert("Error al guardar", message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <Pressable onPress={onClose} style={{ flex: 1 }} />
          <View style={styles.sheet}>
            <View style={styles.handleBar} />

            <View style={styles.headerRow}>
              <AppText variant="subheading">Agregar a mi jardín</AppText>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.thumbnailRow}>
              <Image
                source={{ uri: capturedPhotoUri }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={120}
              />
              <View style={styles.plantNameBlock}>
                <AppText variant="label" numberOfLines={1}>
                  {aiResult.commonName}
                </AppText>
                {aiResult.scientificName ? (
                  <AppText
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.scientificName}
                    numberOfLines={1}
                  >
                    {aiResult.scientificName}
                  </AppText>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="label">Nombre en tu jardín</AppText>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Ej: Monstera grande"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                returnKeyType="next"
                onSubmitEditing={() => locationRef.current?.focus()}
                autoFocus
              />
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="label">
                Ubicación{" "}
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  (opcional)
                </AppText>
              </AppText>
              <TextInput
                ref={locationRef}
                value={locationHome}
                onChangeText={setLocationHome}
                placeholder="Sala, balcón, ventana sur..."
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.publishRow,
                publishToCatalog
                  ? { backgroundColor: theme.colors.primary + "15", borderColor: theme.colors.primary + "40" }
                  : null,
                pressed ? { opacity: 0.75 } : null,
              ]}
              onPress={() => setPublishToCatalog((v) => !v)}
              android_ripple={null}
              accessibilityRole="switch"
              accessibilityState={{ checked: publishToCatalog }}
            >
              <View style={styles.publishTextBlock}>
                <AppText variant="label">Publicar en catálogo</AppText>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  {publishToCatalog
                    ? "Tu foto aparecerá en el catálogo de la comunidad"
                    : "Solo tú verás esta planta en tu jardín"}
                </AppText>
              </View>
              <Switch
                value={publishToCatalog}
                onValueChange={setPublishToCatalog}
                trackColor={{ false: theme.colors.surfaceDivider, true: theme.colors.primary }}
                thumbColor={publishToCatalog ? theme.colors.primaryLight : theme.colors.textMuted}
                ios_backgroundColor={theme.colors.surfaceDivider}
              />
            </Pressable>

            <AppButton
              title={
                isOffline
                  ? "Sin conexión"
                  : isSaving
                  ? "Guardando..."
                  : "Añadir al jardín"
              }
              onPress={handleSave}
              disabled={isSaving || isOffline || !nickname.trim()}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
