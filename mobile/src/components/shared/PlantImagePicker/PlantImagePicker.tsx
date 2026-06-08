import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Alert, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface PlantImagePickerProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  alertTitle?: string;
}

async function launchCamera(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  } catch {
    return null;
  }
}

async function launchGallery(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  } catch {
    return null;
  }
}

export default function PlantImagePicker({ value, onChange, alertTitle = "Imagen de la planta" }: PlantImagePickerProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handlePress = () => {
    const buttons: Parameters<typeof Alert.alert>[2] = [
      {
        text: "Tomar foto",
        onPress: async () => {
          const uri = await launchCamera();
          if (uri) {
            onChange(uri);
          } else {
            Alert.alert("No se pudo acceder a la cámara", "Verifica los permisos en Configuración.");
          }
        },
      },
      {
        text: "Elegir de galería",
        onPress: async () => {
          const uri = await launchGallery();
          if (uri) {
            onChange(uri);
          } else {
            Alert.alert("No se pudo acceder a la galería", "Verifica los permisos en Configuración.");
          }
        },
      },
      ...(value
        ? [{ text: "Eliminar foto", style: "destructive" as const, onPress: () => onChange(null) }]
        : []),
      { text: "Cancelar", style: "cancel" as const },
    ];
    Alert.alert(alertTitle, undefined, buttons);
  };

  if (value) {
    return (
      <TouchableOpacity style={styles.previewContainer} onPress={handlePress} activeOpacity={0.85}>
        <Image source={{ uri: value }} style={styles.previewImage} contentFit="cover" transition={120} />
        <View style={styles.changeOverlay}>
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          <AppText variant="caption" style={styles.changeText}>
            Cambiar foto
          </AppText>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.emptyContainer} onPress={handlePress} activeOpacity={0.85}>
      <Ionicons name="camera-outline" size={28} color={theme.colors.textSecondary} />
      <AppText variant="caption" color={theme.colors.textSecondary}>
        Agregar foto
      </AppText>
    </TouchableOpacity>
  );
}
