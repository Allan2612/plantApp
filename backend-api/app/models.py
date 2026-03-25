from typing import Literal

from pydantic import BaseModel, Field


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
