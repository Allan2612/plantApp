import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { createStyles } from "./styles";

interface CatalogPlantCardProps {
  plant: PlantCatalogItem;
}

function mapDifficultyLabel(value: PlantCatalogItem["difficulty"]) {
  if (value === "easy") return "Facil";
  if (value === "medium") return "Intermedia";
  return "Dificil";
}

function resolveImageUrl(imageUrl: string | null): string | null {
  const raw = imageUrl?.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  // Evita hosts de ejemplo que no existen y causan imagen rota permanente.
  if (lower.includes("example.com")) return null;

  if (!/^https?:\/\//i.test(raw)) return null;

  // Evita doble-encoding (%20 -> %2520): decodifica una vez y vuelve a codificar.
  try {
    return encodeURI(decodeURI(raw));
  } catch {
    return raw;
  }
}

export default function CatalogPlantCard({ plant }: CatalogPlantCardProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const imageUrl = useMemo(() => resolveImageUrl(plant.imageUrl), [plant.imageUrl]);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <View style={styles.card}>
      {imageUrl && !hasImageError ? (
        <ExpoImage
          source={{ uri: imageUrl }}
          style={styles.image}
          accessibilityLabel={`Imagen de ${plant.name}`}
          contentFit="cover"
          transition={180}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Ionicons name="leaf" size={theme.spacing.xl} color={colors.primary} />
        </View>
      )}

      <View style={styles.content}>
        <AppText variant="subheading">{plant.name}</AppText>
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={styles.scientificName}
        >
          {plant.scientificName}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} numberOfLines={2}>
          {plant.description}
        </AppText>

        <View style={styles.row}>
          <View style={styles.badge}>
            <AppText variant="caption" color={colors.primaryMuted}>
              {mapDifficultyLabel(plant.difficulty)}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textMuted}>
            {plant.climate ?? "Sin clima definido"}
          </AppText>
        </View>
      </View>
    </View>
  );
}
