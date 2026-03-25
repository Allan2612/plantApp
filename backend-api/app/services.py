import logging
from datetime import datetime
from typing import Any

from fastapi import HTTPException

from .firebase import get_firestore_client

logger = logging.getLogger(__name__)


def _serialize_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, list):
        return [_serialize_value(item) for item in value]

    if isinstance(value, dict):
        return {
            nested_key: _serialize_value(nested_value)
            for nested_key, nested_value in value.items()
        }

    return value


def _serialize_document(document) -> dict[str, Any]:
    payload = {
        key: _serialize_value(value) for key, value in document.to_dict().items()
    }
    payload["id"] = document.id
    return payload


def get_document(collection_name: str, document_id: str) -> dict[str, Any]:
    try:
        db = get_firestore_client()
        snapshot = db.collection(collection_name).document(document_id).get()

        if not snapshot.exists:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontro el documento '{document_id}' en '{collection_name}'.",
            )

        return _serialize_document(snapshot)
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error consultando documento en Firestore. collection=%s document_id=%s",
            collection_name,
            document_id,
        )
        raise


def get_collection(
    collection_name: str,
    *,
    filters: list[tuple[str, str, Any]] | None = None,
    order_by: str | None = None,
) -> list[dict[str, Any]]:
    try:
        db = get_firestore_client()
        query = db.collection(collection_name)

        for field_name, operator, value in filters or []:
            query = query.where(field_name, operator, value)

        if order_by:
            query = query.order_by(order_by)

        return [_serialize_document(document) for document in query.stream()]
    except Exception:
        logger.exception(
            "Error consultando coleccion en Firestore. collection=%s order_by=%s",
            collection_name,
            order_by,
        )
        raise


def get_user_profile_payload(user_id: str) -> dict[str, Any]:
    user = get_document("users", user_id)
    stats = get_collection("userStats", filters=[("userId", "==", user_id)], order_by="order")
    info_tiles = get_collection(
        "userInfoTiles",
        filters=[("userId", "==", user_id)],
        order_by="order",
    )
    categories = get_collection("categories", order_by="order")

    favorite_plant = None
    favorite_plant_catalog = None
    favorite_plant_id = user.get("favoritePlantId")

    if isinstance(favorite_plant_id, str) and favorite_plant_id:
        try:
            favorite_plant = get_document("userPlants", favorite_plant_id)
        except HTTPException as exc:
            if exc.status_code == 404:
                logger.warning(
                    "favoritePlantId no encontrado para user_id=%s favoritePlantId=%s",
                    user_id,
                    favorite_plant_id,
                )
                favorite_plant = None
            else:
                raise

        if isinstance(favorite_plant, dict):
            favorite_catalog_id = favorite_plant.get("plantCatalogId")
            if isinstance(favorite_catalog_id, str) and favorite_catalog_id:
                try:
                    favorite_plant_catalog = get_document("plantsCatalog", favorite_catalog_id)
                except HTTPException as exc:
                    if exc.status_code == 404:
                        logger.warning(
                            "Catalogo favorito no encontrado. user_id=%s catalog_id=%s",
                            user_id,
                            favorite_catalog_id,
                        )
                    else:
                        raise

    return {
        "user": user,
        "stats": stats,
        "infoTiles": info_tiles,
        "favoritePlant": favorite_plant,
        "favoritePlantCatalog": favorite_plant_catalog,
        "categories": categories,
    }


def get_user_plants_payload(user_id: str) -> dict[str, Any]:
    user_plants = get_collection("userPlants", filters=[("userId", "==", user_id)])

    tags = get_collection("plantTags", filters=[("userId", "==", user_id)], order_by="order")
    schedule = get_collection(
        "careSchedule",
        filters=[("userId", "==", user_id)],
        order_by="scheduledFor",
    )

    tags_by_plant: dict[str, list[dict[str, Any]]] = {}
    for tag in tags:
        plant_id = tag.get("userPlantId")
        if isinstance(plant_id, str):
            tags_by_plant.setdefault(plant_id, []).append(tag)

    schedule_by_plant: dict[str, list[dict[str, Any]]] = {}
    for task in schedule:
        plant_id = task.get("userPlantId")
        if isinstance(plant_id, str):
            schedule_by_plant.setdefault(plant_id, []).append(task)

    catalog_cache: dict[str, dict[str, Any] | None] = {}
    items: list[dict[str, Any]] = []
    for user_plant in user_plants:
        catalog_plant = None
        catalog_id = user_plant.get("plantCatalogId")

        if not isinstance(user_plant.get("id"), str):
            logger.warning("userPlant sin id valido. user_id=%s payload=%s", user_id, user_plant)
            continue

        if isinstance(catalog_id, str) and catalog_id:
            if catalog_id in catalog_cache:
                catalog_plant = catalog_cache[catalog_id]
            else:
                try:
                    catalog_plant = get_document("plantsCatalog", catalog_id)
                except HTTPException as exc:
                    if exc.status_code == 404:
                        logger.warning(
                            "plantCatalogId no encontrado. user_id=%s catalog_id=%s",
                            user_id,
                            catalog_id,
                        )
                        catalog_plant = None
                    else:
                        raise
                catalog_cache[catalog_id] = catalog_plant

        plant_id = user_plant.get("id")
        items.append(
            {
                "userPlant": user_plant,
                "catalogPlant": catalog_plant,
                "tags": tags_by_plant.get(plant_id, []),
                "upcomingCare": schedule_by_plant.get(plant_id, []),
            }
        )

    return {
        "userId": user_id,
        "count": len(items),
        "items": items,
    }


def get_user_plant_detail_payload(user_plant_id: str) -> dict[str, Any]:
    user_plant = get_document("userPlants", user_plant_id)

    catalog_plant = None
    catalog_id = user_plant.get("plantCatalogId")
    if isinstance(catalog_id, str) and catalog_id:
        try:
            catalog_plant = get_document("plantsCatalog", catalog_id)
        except HTTPException as exc:
            if exc.status_code == 404:
                logger.warning(
                    "plantCatalogId no encontrado para userPlantId=%s catalog_id=%s",
                    user_plant_id,
                    catalog_id,
                )
                catalog_plant = None
            else:
                raise

    tags = get_collection(
        "plantTags",
        filters=[("userPlantId", "==", user_plant_id)],
        order_by="order",
    )
    care_schedule = get_collection(
        "careSchedule",
        filters=[("userPlantId", "==", user_plant_id)],
        order_by="scheduledFor",
    )
    care_history = get_collection(
        "careHistory",
        filters=[("userPlantId", "==", user_plant_id)],
        order_by="completedAt",
    )

    return {
        "userPlant": user_plant,
        "catalogPlant": catalog_plant,
        "tags": tags,
        "careSchedule": care_schedule,
        "careHistory": care_history,
    }
