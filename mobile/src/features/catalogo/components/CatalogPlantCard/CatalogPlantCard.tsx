import AppText from "@/src/components/shared/AppText/AppText";
import { buildImageSource, useCatalogPlantCard } from "@/src/features/catalogo/hooks/useCatalogPlantCard";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";
import { createStyles } from "./styles";

const DIFF_COLOR: Record<string, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

interface CatalogPlantCardProps {
  plant: PlantCatalogItem;
}

export default function CatalogPlantCard({ plant }: CatalogPlantCardProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { difficultyLabel, shouldRenderImage, onImageError } = useCatalogPlantCard(plant);
  const diffColor = DIFF_COLOR[plant.difficulty ?? "medium"] ?? "#f59e0b";

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {shouldRenderImage ? (
          <Image
            source={buildImageSource(plant.imageUrl)}
            style={styles.image}
            contentFit="cover"
            transition={120}
            accessibilityLabel={`Imagen de ${plant.name}`}
            onError={onImageError}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="leaf" size={28} color={colors.primary} />
          </View>
        )}
        {plant.isToxic ? (
          <View style={styles.toxicBadge}>
            <Ionicons name="warning-outline" size={9} color="#ef4444" />
            <AppText style={styles.toxicBadgeText}>Tóxica</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View>
          <AppText variant="label" numberOfLines={1}>{plant.name}</AppText>
          <AppText
            variant="caption"
            color={colors.textSecondary}
            style={styles.scientificName}
            numberOfLines={1}
          >
            {plant.scientificName}
          </AppText>
        </View>
        {plant.description ? (
          <AppText
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={2}
            style={styles.description}
          >
            {plant.description}
          </AppText>
        ) : null}
        <View style={styles.badgeRow}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + "18", borderColor: diffColor + "50" }]}>
            <AppText style={[styles.diffBadgeText, { color: diffColor }]}>
              {difficultyLabel}
            </AppText>
          </View>
          {plant.climate ? (
            <View style={styles.climateBadge}>
              <Ionicons name="partly-sunny-outline" size={10} color={colors.textMuted} />
              <AppText style={styles.climateText} numberOfLines={1}>
                {plant.climate}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
