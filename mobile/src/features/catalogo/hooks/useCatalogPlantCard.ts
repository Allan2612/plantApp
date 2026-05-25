import { PlantCatalogItem } from "@/src/types/plant.types";
import { useEffect, useState } from "react";

export function buildImageSource(uri: string | null | undefined) {
  if (!uri) return null;
  return { uri };
}

function mapDifficultyLabel(value: PlantCatalogItem["difficulty"]) {
  if (value === "easy") return "Facil";
  if (value === "medium") return "Intermedia";
  return "Dificil";
}

export function useCatalogPlantCard(plant: PlantCatalogItem) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [plant.imageUrl]);

  const shouldRenderImage = Boolean(plant.imageUrl) && !imageFailed;

  const onImageError = () => {
    setImageFailed(true);
  };

  return {
    difficultyLabel: mapDifficultyLabel(plant.difficulty),
    shouldRenderImage,
    onImageError,
  };
}
