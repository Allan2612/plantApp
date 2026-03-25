export interface Plant {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

export interface PlantCatalogItem {
  id: string;
  name: string;
  scientificName: string;
  iconType: string;
  iconEmoji: string;
  description: string;
  origin: string | null;
  climate: string | null;
  growthTimeDays: number | null;
  maxHeightCm: number | null;
  floweringType: string | null;
  isToxic: boolean;
  waterAmountMl: number | null;
  careFrequencyPerWeek: number | null;
  fertilizerType: string | null;
  fertilizerFrequencyDays: number | null;
  lightNotes: string | null;
  generalCareNotes: string | null;
  difficulty: "easy" | "medium" | "hard";
  imageUrl: string | null;
}
