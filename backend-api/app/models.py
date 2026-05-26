from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class FirestoreBaseModel(BaseModel):
    id: str
    createdAt: str | None = None
    updatedAt: str | None = None


class UserModel(FirestoreBaseModel):
    email: str
    displayName: str
    firstName: str
    lastName: str
    username: str
    avatarId: str
    provider: Literal["password", "google", "apple"] | str
    acceptedTerms: bool
    headline: str | None = None
    visibility: Literal["public", "private", "friends"]
    birthDate: str | None = None
    streakDays: int
    streakText: str
    favoritePlantId: str | None = None
    themePreference: Literal["light", "dark", "system"]
    status: Literal["active", "inactive"]
    plantCount: int
    city: str | None = None


class UserStatModel(FirestoreBaseModel):
    userId: str
    label: str
    value: int | float | str
    helper: str | None = None
    order: int


class UserInfoTileModel(FirestoreBaseModel):
    userId: str
    kind: str
    iconType: str
    iconEmoji: str
    title: str
    value: str
    order: int


class CategoryModel(FirestoreBaseModel):
    name: str
    iconType: str
    iconEmoji: str
    type: Literal["plant", "space"] | str
    order: int


class PlantCatalogModel(FirestoreBaseModel):
    name: str
    scientificName: str
    nicknames: list[str] = Field(default_factory=list)
    categoryIds: list[str] = Field(default_factory=list)
    iconType: str
    iconEmoji: str
    description: str
    origin: str | None = None
    climate: str | None = None
    growthTimeDays: int | None = None
    maxHeightCm: int | None = None
    floweringType: str | None = None
    isToxic: bool
    waterAmountMl: int | None = None
    careFrequencyPerWeek: int | None = None
    fertilizerType: str | None = None
    fertilizerFrequencyDays: int | None = None
    lightNotes: str | None = None
    generalCareNotes: str | None = None
    difficulty: Literal["easy", "medium", "hard"]
    imageUrl: str | None = None
    ownerUserId: str | None = None
    ownerUsername: str | None = None
    ownerDisplayName: str | None = None
    ownerAvatarId: str | None = None
    likeCount: int = 0
    commentCount: int = 0
    isLikedByCurrentUser: bool = False


class PlantCommentWithAuthorModel(BaseModel):
    id: str
    plantCatalogId: str
    userId: str
    text: str
    createdAt: str | None = None
    authorUsername: str | None = None
    authorDisplayName: str | None = None
    authorAvatarId: str | None = None


class CreateCommentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    userId: str
    text: str


class ToggleLikeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    userId: str


class ToggleLikeResponse(BaseModel):
    liked: bool
    likeCount: int


class PublicUserModel(BaseModel):
    id: str
    displayName: str
    username: str
    avatarId: str
    headline: str | None = None
    city: str | None = None
    plantCount: int = 0
    createdAt: str | None = None


class PublicProfileResponse(BaseModel):
    user: PublicUserModel
    catalogPosts: list[PlantCatalogModel]
    totalLikes: int


class UserPlantModel(FirestoreBaseModel):
    userId: str
    plantCatalogId: str | None = None
    nickname: str
    customImageUrl: str | None = None
    status: Literal["active", "archived"]
    progress: int
    favorite: bool
    healthStatus: Literal["good", "regular", "bad"]
    locationHome: str | None = None
    acquiredDate: str | None = None
    lastWateredAt: str | None = None
    notes: str | None = None


class UpdateUserRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    displayName: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    username: str | None = None
    avatarId: str | None = None
    headline: str | None = None
    visibility: Literal["public", "private", "friends"] | None = None
    birthDate: str | None = None
    themePreference: Literal["light", "dark", "system"] | None = None
    city: str | None = None


class UpdateUserPlantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plantCatalogId: str | None = None
    nickname: str | None = None
    healthStatus: Literal["good", "regular", "bad"] | None = None
    locationHome: str | None = None
    acquiredDate: str | None = None
    notes: str | None = None
    customImageUrl: str | None = None


class CreateUserPlantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    userId: str
    plantCatalogId: str | None = None
    nickname: str
    healthStatus: Literal["good", "regular", "bad"] | None = None
    locationHome: str | None = None
    acquiredDate: str | None = None
    notes: str | None = None
    customImageUrl: str | None = None
    favorite: bool | None = None


class CreateCatalogPlantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    scientificName: str
    description: str
    difficulty: Literal["easy", "medium", "hard"]
    isToxic: bool | None = None
    climate: str | None = None
    origin: str | None = None
    lightNotes: str | None = None
    generalCareNotes: str | None = None
    imageUrl: str | None = None
    categoryIds: list[str] | None = None
    nicknames: list[str] | None = None
    ownerUserId: str | None = None


class SyncAuthUserRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str
    displayName: str | None = None
    provider: Literal["password", "google", "apple"] | str | None = None
    avatarId: str | None = None
    acceptedTerms: bool | None = None


class PlantTagModel(FirestoreBaseModel):
    userId: str
    userPlantId: str
    value: str
    order: int


class CareScheduleItemModel(FirestoreBaseModel):
    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    status: Literal["pending", "completed", "skipped"]
    scheduledFor: str
    notes: str | None = None


class CareHistoryItemModel(FirestoreBaseModel):
    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    value: str | None = None
    notes: str | None = None
    completedAt: str


class ProfileResponse(BaseModel):
    user: UserModel
    stats: list[UserStatModel]
    infoTiles: list[UserInfoTileModel]
    favoritePlant: UserPlantModel | None = None
    favoritePlantCatalog: PlantCatalogModel | None = None
    categories: list[CategoryModel]


class UserPlantSummaryResponse(BaseModel):
    userPlant: UserPlantModel
    catalogPlant: PlantCatalogModel | None = None
    tags: list[PlantTagModel] = Field(default_factory=list)
    upcomingCare: list[CareScheduleItemModel] = Field(default_factory=list)


class UserPlantDetailResponse(BaseModel):
    userPlant: UserPlantModel
    catalogPlant: PlantCatalogModel | None = None
    tags: list[PlantTagModel] = Field(default_factory=list)
    careSchedule: list[CareScheduleItemModel] = Field(default_factory=list)
    careHistory: list[CareHistoryItemModel] = Field(default_factory=list)


class UserPlantsResponse(BaseModel):
    userId: str
    count: int
    items: list[UserPlantSummaryResponse]


class PlantIdentificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    image_base64: str
    user_context: str | None = None


class PlantIdentificationResponse(BaseModel):
    is_plant: bool
    confidence: float
    common_name: str | None = None
    scientific_name: str | None = None
    nicknames: list[str] = Field(default_factory=list)
    description: str | None = None
    care_summary: str | None = None
    watering_notes: str | None = None
    light_notes: str | None = None
    difficulty: Literal["easy", "medium", "hard"] | None = None
    is_toxic: bool | None = None


class ImageUploadResponse(BaseModel):
    url: str
