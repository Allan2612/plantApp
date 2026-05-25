import logging

from fastapi import APIRouter, File, UploadFile
from fastapi import HTTPException

from .models import (
    CareHistoryItemModel,
    CareScheduleItemModel,
    CategoryModel,
    CreateCatalogPlantRequest,
    CreateUserPlantRequest,
    ImageUploadResponse,
    PlantCatalogModel,
    PlantIdentificationRequest,
    PlantIdentificationResponse,
    PlantTagModel,
    ProfileResponse,
    SyncAuthUserRequest,
    UpdateUserPlantRequest,
    UpdateUserRequest,
    UserPlantDetailResponse,
    UserPlantModel,
    UserPlantsResponse,
    UserInfoTileModel,
    UserModel,
    UserStatModel,
)
from .services import (
    create_catalog_plant,
    create_user_plant,
    enrich_catalog_with_authors,
    get_collection,
    get_document,
    get_user_by_email,
    get_user_plant_detail_payload,
    get_user_plants_payload,
    get_user_profile_payload,
    sync_user_from_auth,
    update_user_fields,
    update_user_plant_fields,
    upload_image_to_storage,
)
from .firebase import get_firestore_client
from .services_ai import identify_plant_from_base64

router = APIRouter()
logger = logging.getLogger(__name__)


def _validate_required_id(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise HTTPException(status_code=400, detail=f"{field_name} es requerido")
    return value.strip()


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/api/identify-plant", response_model=PlantIdentificationResponse)
def post_identify_plant(payload: PlantIdentificationRequest) -> dict:
    if not payload.image_base64.strip():
        raise HTTPException(status_code=400, detail="image_base64 es requerido")
    try:
        result = identify_plant_from_base64(
            payload.image_base64,
            payload.user_context or "",
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception:
        logger.exception("Error inesperado en post_identify_plant")
        raise HTTPException(status_code=500, detail="Error interno al identificar la planta")


@router.get("/api/users/by-email", response_model=UserModel)
def read_user_by_email(email: str) -> dict:
    validated_email = email.strip().lower()
    if not validated_email:
        raise HTTPException(status_code=400, detail="email es requerido")

    try:
        return get_user_by_email(validated_email)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_user_by_email. email=%s", validated_email)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/users/sync-auth", response_model=UserModel)
def post_sync_auth_user(payload: SyncAuthUserRequest) -> dict:
    try:
        return sync_user_from_auth(payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en post_sync_auth_user")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}", response_model=UserModel)
def read_user(user_id: str) -> dict:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_document("users", validated_user_id)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_user. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.patch("/api/users/{user_id}", response_model=UserModel)
def patch_user(user_id: str, payload: UpdateUserRequest) -> dict:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return update_user_fields(validated_user_id, payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en patch_user. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/profile", response_model=ProfileResponse)
def read_user_profile(user_id: str) -> dict:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        data = get_user_profile_payload(validated_user_id)
        return ProfileResponse(**data).model_dump()
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_user_profile. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/plants", response_model=UserPlantsResponse)
def read_user_plants(user_id: str) -> dict:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_user_plants_payload(validated_user_id)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_user_plants. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/user-plants/{user_plant_id}", response_model=UserPlantDetailResponse)
def read_user_plant_detail(user_plant_id: str) -> dict:
    validated_user_plant_id = _validate_required_id(user_plant_id, "user_plant_id")
    try:
        data = get_user_plant_detail_payload(validated_user_plant_id)
        return UserPlantDetailResponse(**data).model_dump()
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en read_user_plant_detail. user_plant_id=%s",
            validated_user_plant_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.patch("/api/user-plants/{user_plant_id}", response_model=UserPlantModel)
def patch_user_plant(user_plant_id: str, payload: UpdateUserPlantRequest) -> dict:
    validated_user_plant_id = _validate_required_id(user_plant_id, "user_plant_id")
    try:
        return update_user_plant_fields(validated_user_plant_id, payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en patch_user_plant. user_plant_id=%s",
            validated_user_plant_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/user-plants", response_model=UserPlantModel)
def post_user_plant(payload: CreateUserPlantRequest) -> dict:
    try:
        return create_user_plant(payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en post_user_plant")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/catalog/plants", response_model=list[PlantCatalogModel])
def read_catalog_plants() -> list[dict]:
    try:
        items = get_collection("plantsCatalog")
        items.sort(key=lambda item: str(item.get("createdAt") or ""), reverse=True)
        return enrich_catalog_with_authors(items)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_catalog_plants")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/catalog/plants", response_model=PlantCatalogModel)
def post_catalog_plant(payload: CreateCatalogPlantRequest) -> dict:
    try:
        return create_catalog_plant(payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en post_catalog_plant")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/catalog/plants/{plant_catalog_id}", response_model=PlantCatalogModel)
def read_catalog_plant(plant_catalog_id: str) -> dict:
    validated_catalog_id = _validate_required_id(plant_catalog_id, "plant_catalog_id")
    try:
        item = get_document("plantsCatalog", validated_catalog_id)
        enriched = enrich_catalog_with_authors([item])
        return enriched[0]
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en read_catalog_plant. plant_catalog_id=%s",
            validated_catalog_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/categories", response_model=list[CategoryModel])
def read_categories() -> list[dict]:
    try:
        return get_collection("categories", order_by="order")
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_categories")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/plant-tags", response_model=list[PlantTagModel])
def read_user_plant_tags(user_id: str) -> list[dict]:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_collection(
            "plantTags",
            filters=[("userId", "==", validated_user_id)],
            order_by="order",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_user_plant_tags. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/care-schedule", response_model=list[CareScheduleItemModel])
def read_user_care_schedule(user_id: str) -> list[dict]:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_collection(
            "careSchedule",
            filters=[("userId", "==", validated_user_id)],
            order_by="scheduledFor",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en read_user_care_schedule. user_id=%s",
            validated_user_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/care-history", response_model=list[CareHistoryItemModel])
def read_user_care_history(user_id: str) -> list[dict]:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_collection(
            "careHistory",
            filters=[("userId", "==", validated_user_id)],
            order_by="completedAt",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en read_user_care_history. user_id=%s",
            validated_user_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/stats", response_model=list[UserStatModel])
def read_user_stats(user_id: str) -> list[dict]:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_collection(
            "userStats",
            filters=[("userId", "==", validated_user_id)],
            order_by="order",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en read_user_stats. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/info-tiles", response_model=list[UserInfoTileModel])
def read_user_info_tiles(user_id: str) -> list[dict]:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        return get_collection(
            "userInfoTiles",
            filters=[("userId", "==", validated_user_id)],
            order_by="order",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en read_user_info_tiles. user_id=%s",
            validated_user_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/users/{user_id}/avatar", response_model=ImageUploadResponse)
async def upload_user_avatar(user_id: str, file: UploadFile = File(...)) -> dict:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        file_bytes = await file.read()
        url = upload_image_to_storage(
            file_bytes,
            file.content_type,
            f"user-avatars/{validated_user_id}/avatar",
        )
        db = get_firestore_client()
        db.collection("users").document(validated_user_id).update({"avatarId": url})
        return {"url": url}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en upload_user_avatar. user_id=%s", validated_user_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/user-plants/{user_plant_id}/image", response_model=ImageUploadResponse)
async def upload_user_plant_image(user_plant_id: str, file: UploadFile = File(...)) -> dict:
    validated_id = _validate_required_id(user_plant_id, "user_plant_id")
    try:
        file_bytes = await file.read()
        url = upload_image_to_storage(
            file_bytes,
            file.content_type,
            f"user-plants/{validated_id}/image",
        )
        db = get_firestore_client()
        db.collection("userPlants").document(validated_id).update({"customImageUrl": url})
        return {"url": url}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en upload_user_plant_image. user_plant_id=%s", validated_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/catalog/plants/{plant_catalog_id}/image", response_model=ImageUploadResponse)
async def upload_catalog_plant_image(plant_catalog_id: str, file: UploadFile = File(...)) -> dict:
    validated_id = _validate_required_id(plant_catalog_id, "plant_catalog_id")
    try:
        file_bytes = await file.read()
        url = upload_image_to_storage(
            file_bytes,
            file.content_type,
            f"catalog-plants/{validated_id}/image",
        )
        db = get_firestore_client()
        db.collection("plantsCatalog").document(validated_id).update({"imageUrl": url})
        return {"url": url}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado en upload_catalog_plant_image. plant_catalog_id=%s", validated_id)
        raise HTTPException(status_code=500, detail="Error interno del servidor")
