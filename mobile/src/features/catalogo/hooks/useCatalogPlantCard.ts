import { useAuthStore } from "@/src/store/auth.store";
import { togglePlantLike } from "@/src/features/catalogo/services/socialApi.service";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { useCallback, useEffect, useState } from "react";

export function buildImageSource(uri: string | null | undefined) {
  if (!uri) return null;
  return { uri };
}

function mapDifficultyLabel(value: PlantCatalogItem["difficulty"]) {
  if (value === "easy") return "Fácil";
  if (value === "medium") return "Intermedia";
  return "Difícil";
}

export function useCatalogPlantCard(plant: PlantCatalogItem) {
  const userId = useAuthStore((state) => state.profile?.user?.id ?? null);
  const [imageFailed, setImageFailed] = useState(false);
  const [liked, setLiked] = useState(plant.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(plant.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [plant.imageUrl]);

  useEffect(() => {
    setLiked(plant.isLikedByCurrentUser);
    setLikeCount(plant.likeCount);
  }, [plant.isLikedByCurrentUser, plant.likeCount]);

  const shouldRenderImage = Boolean(plant.imageUrl) && !imageFailed;

  const onImageError = () => setImageFailed(true);

  const handleLike = useCallback(async () => {
    if (!userId || isLiking) return;
    setIsLiking(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    try {
      const result = await togglePlantLike(plant.id, userId);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  }, [userId, isLiking, liked, likeCount, plant.id]);

  return {
    difficultyLabel: mapDifficultyLabel(plant.difficulty),
    shouldRenderImage,
    onImageError,
    liked,
    likeCount,
    commentCount: plant.commentCount,
    isLiking,
    handleLike,
    canLike: Boolean(userId),
  };
}
