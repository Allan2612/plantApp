import AppText from "@/src/components/shared/AppText/AppText";
import { buildImageSource, useCatalogPlantCard } from "@/src/features/catalogo/hooks/useCatalogPlantCard";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

const DIFF_COLOR: Record<string, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

interface CatalogPlantCardProps {
  plant: PlantCatalogItem;
  onCommentPress?: (plant: PlantCatalogItem) => void;
}

function getInitial(plant: PlantCatalogItem): string {
  const source = plant.ownerDisplayName ?? plant.ownerUsername ?? "?";
  return source.trim().charAt(0).toUpperCase() || "?";
}

function getAuthorLabel(plant: PlantCatalogItem): string {
  if (plant.ownerDisplayName) return plant.ownerDisplayName;
  if (plant.ownerUsername) return `@${plant.ownerUsername}`;
  return "Comunidad";
}

export default function CatalogPlantCard({ plant, onCommentPress }: CatalogPlantCardProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const router = useRouter();
  const {
    difficultyLabel,
    shouldRenderImage,
    onImageError,
    liked,
    likeCount,
    commentCount,
    isLiking,
    handleLike,
    canLike,
  } = useCatalogPlantCard(plant);
  const diffColor = DIFF_COLOR[plant.difficulty ?? "medium"] ?? "#f59e0b";

  const handleAuthorPress = () => {
    if (plant.ownerUserId) {
      router.push(`/user/${plant.ownerUserId}` as never);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.authorRow}
        onPress={handleAuthorPress}
        activeOpacity={plant.ownerUserId ? 0.7 : 1}
        disabled={!plant.ownerUserId}
      >
        <View style={styles.avatarCircle}>
          <AppText style={styles.avatarText}>{getInitial(plant)}</AppText>
        </View>
        <View style={styles.authorTextBlock}>
          <AppText variant="label" numberOfLines={1}>
            {getAuthorLabel(plant)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            publicó esta planta
          </AppText>
        </View>
        {plant.ownerUserId ? (
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        ) : null}
      </TouchableOpacity>

      <View style={styles.imageWrap}>
        {shouldRenderImage ? (
          <Image
            source={buildImageSource(plant.imageUrl)}
            style={styles.image}
            contentFit="cover"
            transition={120}
            accessibilityLabel={`Foto de ${plant.name}`}
            onError={onImageError}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="leaf" size={36} color={colors.primary} />
          </View>
        )}
        {plant.isToxic ? (
          <View style={styles.toxicBadge}>
            <Ionicons name="warning-outline" size={10} color="#FFFFFF" />
            <AppText style={styles.toxicBadgeText}>Tóxica</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleBlock}>
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

        {plant.nicknames && plant.nicknames.length > 0 ? (
          <View style={styles.nicknamesRow}>
            {plant.nicknames.slice(0, 4).map((nickname) => (
              <View key={nickname} style={styles.nicknameChip}>
                <AppText style={styles.nicknameChipText}>{nickname}</AppText>
              </View>
            ))}
          </View>
        ) : null}

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

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleLike}
            activeOpacity={0.75}
            disabled={!canLike || isLiking}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? "#ef4444" : colors.textSecondary}
            />
            {likeCount > 0 ? (
              <AppText style={[styles.socialCount, liked ? { color: "#ef4444" } : null]}>
                {likeCount}
              </AppText>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => onCommentPress?.(plant)}
            activeOpacity={0.75}
          >
            <Ionicons name="chatbubble-outline" size={17} color={colors.textSecondary} />
            {commentCount > 0 ? (
              <AppText style={styles.socialCount}>{commentCount}</AppText>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
