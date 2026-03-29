import AppText from "@/src/components/shared/AppText/AppText";
import { useCatalogPlantCard } from "@/src/features/catalogo/hooks/useCatalogPlantCard";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";
import { createStyles } from "./styles";

interface CatalogPlantCardProps {
  plant: PlantCatalogItem;
}

export default function CatalogPlantCard({ plant }: CatalogPlantCardProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { difficultyLabel, shouldRenderImage, onImageError } =
    useCatalogPlantCard(plant);

  return (
    <View style={styles.card}>
      {shouldRenderImage ? (
        <Image
          source={{ uri: plant.imageUrl ?? "" }}
          style={styles.image}
          contentFit="cover"
          transition={120}
          accessibilityLabel={`Imagen de ${plant.name}`}
          onError={onImageError}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Ionicons
            name="leaf"
            size={theme.spacing.xl}
            color={colors.primary}
          />
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
              {difficultyLabel}
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
