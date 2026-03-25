import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import { createStyles } from "./styles";

interface CatalogPlantCardProps {
  plant: PlantCatalogItem;
}

function mapDifficultyLabel(value: PlantCatalogItem["difficulty"]) {
  if (value === "easy") return "Facil";
  if (value === "medium") return "Intermedia";
  return "Dificil";
}

export default function CatalogPlantCard({ plant }: CatalogPlantCardProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      {plant.imageUrl ? (
        <Image
          source={{ uri: plant.imageUrl }}
          style={styles.image}
          accessibilityLabel={`Imagen de ${plant.name}`}
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
