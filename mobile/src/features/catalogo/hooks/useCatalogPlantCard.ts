import { PlantCatalogItem } from "@/src/types/plant.types";
import { useEffect, useState } from "react";

const WIKIMEDIA_UA = "PlantApp/1.0 (plant identification app; educational)";

export function buildImageSource(uri: string | null | undefined) {
  if (!uri) return null;
  if (/wikimedia\.org|wikipedia\.org/i.test(uri)) {
    return { uri, headers: { "User-Agent": WIKIMEDIA_UA } };
  }
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
