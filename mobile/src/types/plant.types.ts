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
  nicknames: string[];
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
  ownerUserId: string | null;
  ownerUsername: string | null;
  ownerDisplayName: string | null;
  ownerAvatarId: string | null;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

export interface PlantComment {
  id: string;
  plantCatalogId: string;
  userId: string;
  text: string;
  createdAt: string | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorAvatarId: string | null;
}

export interface PublicUserProfile {
  id: string;
  displayName: string;
  username: string;
  avatarId: string;
  headline: string | null;
  city: string | null;
  plantCount: number;
  createdAt: string | null;
}

export interface PublicProfileData {
  user: PublicUserProfile;
  catalogPosts: PlantCatalogItem[];
  totalLikes: number;
}

export type PlantHealthStatus = "good" | "regular" | "bad";

export interface UpdateUserPlantPayload {
  plantCatalogId?: string;
  nickname?: string;
  healthStatus?: PlantHealthStatus;
  locationHome?: string;
  acquiredDate?: string;
  notes?: string;
  customImageUrl?: string;
}

export interface CreateUserPlantPayload {
  userId: string;
  plantCatalogId?: string;
  nickname: string;
  healthStatus?: PlantHealthStatus;
  locationHome?: string;
  acquiredDate?: string;
  notes?: string;
  customImageUrl?: string;
  favorite?: boolean;
}

export type CatalogDifficulty = "easy" | "medium" | "hard";

export interface CreateCatalogPlantPayload {
  name: string;
  scientificName: string;
  description: string;
  difficulty: CatalogDifficulty;
  isToxic?: boolean;
  climate?: string;
  origin?: string;
  lightNotes?: string;
  generalCareNotes?: string;
  imageUrl?: string;
  categoryIds?: string[];
  nicknames?: string[];
  ownerUserId?: string;
}
