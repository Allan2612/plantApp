import logging
import re
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


def _get_collection_safe(
    collection_name: str,
    *,
    filters: list[tuple[str, str, Any]] | None = None,
    order_by: str | None = None,
) -> list[dict[str, Any]]:
    try:
        return get_collection(collection_name, filters=filters, order_by=order_by)
    except Exception:
        logger.warning(
            "Fallo consulta ordenada. Reintentando sin order_by. collection=%s order_by=%s",
            collection_name,
            order_by,
        )

    try:
        items = get_collection(collection_name, filters=filters)
    except Exception:
        logger.exception(
            "Fallo consulta de respaldo. collection=%s",
            collection_name,
        )
        return []

    if order_by:
        items.sort(key=lambda item: str(item.get(order_by, "")))

    return items


def _build_patch_payload(
    payload: dict[str, Any],
    *,
    allowed_fields: set[str],
) -> dict[str, Any]:
    updates: dict[str, Any] = {}

    for field_name in allowed_fields:
        if field_name in payload and payload[field_name] is not None:
            updates[field_name] = payload[field_name]

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar al menos un campo para actualizar.",
        )

    updates["updatedAt"] = datetime.utcnow()
    return updates


def _patch_document(
    collection_name: str,
    document_id: str,
    updates: dict[str, Any],
) -> dict[str, Any]:
    try:
        db = get_firestore_client()
        reference = db.collection(collection_name).document(document_id)
        snapshot = reference.get()

        if not snapshot.exists:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontro el documento '{document_id}' en '{collection_name}'.",
            )

        reference.update(updates)
        return get_document(collection_name, document_id)
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error actualizando documento en Firestore. collection=%s document_id=%s",
            collection_name,
            document_id,
        )
        raise


def update_user_fields(user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    updates = _build_patch_payload(
        payload,
        allowed_fields={
            "displayName",
            "firstName",
            "lastName",
            "username",
            "avatarId",
            "headline",
            "visibility",
            "birthDate",
            "themePreference",
            "city",
        },
    )
    return _patch_document("users", user_id, updates)


def update_user_plant_fields(user_plant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    updates = _build_patch_payload(
        payload,
        allowed_fields={
            "plantCatalogId",
            "nickname",
            "healthStatus",
            "locationHome",
            "acquiredDate",
            "notes",
            "customImageUrl",
        },
    )

    next_catalog_id = updates.get("plantCatalogId")
    if isinstance(next_catalog_id, str):
        trimmed_catalog_id = next_catalog_id.strip()
        if not trimmed_catalog_id:
            raise HTTPException(status_code=400, detail="plantCatalogId no puede estar vacío")
        get_document("plantsCatalog", trimmed_catalog_id)
        updates["plantCatalogId"] = trimmed_catalog_id

    updated = _patch_document("userPlants", user_plant_id, updates)
    return _normalize_user_plant_payload(updated)


def get_user_by_email(email: str) -> dict[str, Any]:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise HTTPException(status_code=400, detail="email es requerido")

    users = get_collection("users", filters=[("email", "==", normalized_email)])
    if not users:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontro un usuario con email '{normalized_email}'.",
        )

    return users[0]


def _normalize_username(seed: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9._]", "", seed.strip().lower())
    return normalized or "usuario"


def _next_user_id() -> str:
    users = get_collection("users")
    max_index = 0

    for user in users:
        user_id = user.get("id")
        if not isinstance(user_id, str):
            continue

        match = re.fullmatch(r"user-(\d+)", user_id)
        if not match:
            continue

        max_index = max(max_index, int(match.group(1)))

    return f"user-{max_index + 1}"


def _next_user_plant_id() -> str:
    user_plants = get_collection("userPlants")
    max_index = 0

    for item in user_plants:
        item_id = item.get("id")
        if not isinstance(item_id, str):
            continue

        match = re.fullmatch(r"user-plant-(\d+)", item_id)
        if not match:
            continue

        max_index = max(max_index, int(match.group(1)))

    return f"user-plant-{max_index + 1}"


def _normalize_catalog_category_ids(raw_value: Any) -> list[str]:
    if not isinstance(raw_value, list):
        return []

    normalized: list[str] = []
    for value in raw_value:
        if isinstance(value, str):
            trimmed = value.strip()
            if trimmed:
                normalized.append(trimmed)

    return normalized


def _normalize_user_payload(user: dict[str, Any]) -> dict[str, Any]:
    email = str(user.get("email") or "").strip().lower()
    display_name = str(user.get("displayName") or "").strip()
    if not display_name:
        display_name = email.split("@", 1)[0] if "@" in email else "Usuario"

    first_name = str(user.get("firstName") or "").strip()
    if not first_name:
        first_name = display_name

    last_name = str(user.get("lastName") or "").strip()
    username = str(user.get("username") or "").strip()
    if not username:
        username = _normalize_username(email.split("@", 1)[0] if email else display_name)

    provider = str(user.get("provider") or "password").strip().lower()
    provider_map = {
        "google.com": "google",
        "apple.com": "apple",
    }
    provider = provider_map.get(provider, provider)
    if provider not in {"password", "google", "apple"}:
        provider = "password"

    visibility = str(user.get("visibility") or "public").strip().lower()
    if visibility not in {"public", "private", "friends"}:
        visibility = "public"

    theme_preference = str(user.get("themePreference") or "system").strip().lower()
    if theme_preference not in {"system", "light", "dark"}:
        theme_preference = "system"

    status = str(user.get("status") or "active").strip().lower()
    if status not in {"active", "inactive"}:
        status = "active"

    created_at = user.get("createdAt")
    updated_at = user.get("updatedAt")
    now_iso = datetime.utcnow().isoformat()

    payload = {
        **user,
        "email": email,
        "displayName": display_name,
        "firstName": first_name,
        "lastName": last_name,
        "username": username,
        "avatarId": str(user.get("avatarId") or "midori"),
        "provider": provider,
        "acceptedTerms": bool(user.get("acceptedTerms", True)),
        "headline": "" if user.get("headline") is None else str(user.get("headline")),
        "visibility": visibility,
        "birthDate": user.get("birthDate"),
        "streakDays": int(user.get("streakDays") or 0),
        "streakText": str(user.get("streakText") or "Racha de cuidado"),
        "favoritePlantId": user.get("favoritePlantId"),
        "themePreference": theme_preference,
        "status": status,
        "plantCount": int(user.get("plantCount") or 0),
        "city": "" if user.get("city") is None else str(user.get("city")),
        "createdAt": created_at or now_iso,
        "updatedAt": updated_at or now_iso,
    }

    return payload


def _normalize_user_plant_payload(user_plant: dict[str, Any]) -> dict[str, Any]:
    now_iso = datetime.utcnow().isoformat()

    status = str(user_plant.get("status") or "active").strip().lower()
    if status not in {"active", "archived"}:
        status = "active"

    health_status = str(user_plant.get("healthStatus") or "good").strip().lower()
    if health_status not in {"good", "regular", "bad"}:
        health_status = "good"

    progress_raw = user_plant.get("progress")
    progress = progress_raw if isinstance(progress_raw, int) else 0
    progress = min(max(progress, 0), 100)

    return {
        **user_plant,
        "userId": str(user_plant.get("userId") or ""),
        "plantCatalogId": user_plant.get("plantCatalogId"),
        "nickname": str(user_plant.get("nickname") or "Mi planta"),
        "customImageUrl": user_plant.get("customImageUrl"),
        "status": status,
        "progress": progress,
        "favorite": bool(user_plant.get("favorite", False)),
        "healthStatus": health_status,
        "locationHome": user_plant.get("locationHome"),
        "acquiredDate": user_plant.get("acquiredDate"),
        "lastWateredAt": user_plant.get("lastWateredAt"),
        "notes": user_plant.get("notes"),
        "createdAt": user_plant.get("createdAt") or now_iso,
        "updatedAt": user_plant.get("updatedAt") or now_iso,
    }


def sync_user_from_auth(payload: dict[str, Any]) -> dict[str, Any]:
    email = str(payload.get("email", "")).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="email es requerido")

    existing_user = None
    try:
        existing_user = get_user_by_email(email)
    except HTTPException as exc:
        if exc.status_code != 404:
            raise

    if existing_user:
        return existing_user

    display_name = str(payload.get("displayName") or "").strip()
    if not display_name:
        display_name = email.split("@", 1)[0]

    name_parts = [part for part in display_name.split(" ") if part]
    first_name = name_parts[0] if name_parts else display_name
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    username_seed = email.split("@", 1)[0]
    username = _normalize_username(username_seed)
    now_iso = datetime.utcnow().isoformat()

    provider = str(payload.get("provider") or "password").strip().lower()
    provider_map = {
        "google.com": "google",
        "apple.com": "apple",
    }
    provider = provider_map.get(provider, provider)
    if provider not in {"password", "google", "apple"}:
        provider = "password"

    accepted_terms = payload.get("acceptedTerms")
    accepted_terms_value = accepted_terms if isinstance(accepted_terms, bool) else True

    user_document = {
        "email": email,
        "displayName": display_name,
        "firstName": first_name,
        "lastName": last_name,
        "username": username,
        "avatarId": str(payload.get("avatarId") or "midori"),
        "provider": provider,
        "acceptedTerms": accepted_terms_value,
        "headline": "",
        "visibility": "public",
        "birthDate": None,
        "streakDays": 0,
        "streakText": "Racha de cuidado",
        "favoritePlantId": None,
        "themePreference": "system",
        "status": "active",
        "plantCount": 0,
        "city": "",
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    new_user_id = _next_user_id()

    db = get_firestore_client()
    db.collection("users").document(new_user_id).set(user_document)
    return get_document("users", new_user_id)


def create_user_plant(payload: dict[str, Any]) -> dict[str, Any]:
    user_id = str(payload.get("userId") or "").strip()
    plant_catalog_id = str(payload.get("plantCatalogId") or "").strip()
    nickname = str(payload.get("nickname") or "").strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="userId es requerido")
    if not plant_catalog_id:
        raise HTTPException(status_code=400, detail="plantCatalogId es requerido")
    if not nickname:
        raise HTTPException(status_code=400, detail="nickname es requerido")

    user = get_document("users", user_id)
    get_document("plantsCatalog", plant_catalog_id)

    health_status = str(payload.get("healthStatus") or "good").strip().lower()
    if health_status not in {"good", "regular", "bad"}:
        health_status = "good"

    status = str(payload.get("status") or "active").strip().lower()
    if status not in {"active", "archived"}:
        status = "active"

    now_iso = datetime.utcnow().isoformat()
    user_plant_id = _next_user_plant_id()
    favorite = bool(payload.get("favorite", False))

    document = {
        "userId": user_id,
        "plantCatalogId": plant_catalog_id,
        "nickname": nickname,
        "customImageUrl": str(payload.get("customImageUrl") or "") or None,
        "status": status,
        "progress": int(payload.get("progress") or 0),
        "favorite": favorite,
        "healthStatus": health_status,
        "locationHome": str(payload.get("locationHome") or "") or None,
        "acquiredDate": str(payload.get("acquiredDate") or "") or None,
        "lastWateredAt": None,
        "notes": str(payload.get("notes") or "") or None,
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    db = get_firestore_client()
    db.collection("userPlants").document(user_plant_id).set(document)

    current_count = user.get("plantCount")
    normalized_count = int(current_count) if isinstance(current_count, int) else 0
    user_updates: dict[str, Any] = {
        "plantCount": normalized_count + 1,
        "updatedAt": now_iso,
    }
    if favorite and not user.get("favoritePlantId"):
        user_updates["favoritePlantId"] = user_plant_id

    db.collection("users").document(user_id).update(user_updates)
    created = get_document("userPlants", user_plant_id)
    return _normalize_user_plant_payload(created)


def create_catalog_plant(payload: dict[str, Any]) -> dict[str, Any]:
    name = str(payload.get("name") or "").strip()
    scientific_name = str(payload.get("scientificName") or "").strip()
    description = str(payload.get("description") or "").strip()

    if not name:
        raise HTTPException(status_code=400, detail="name es requerido")
    if not scientific_name:
        raise HTTPException(status_code=400, detail="scientificName es requerido")
    if not description:
        raise HTTPException(status_code=400, detail="description es requerido")

    difficulty = str(payload.get("difficulty") or "").strip().lower()
    if difficulty not in {"easy", "medium", "hard"}:
        raise HTTPException(status_code=400, detail="difficulty debe ser easy, medium o hard")

    existing_items = get_collection("plantsCatalog", filters=[("scientificName", "==", scientific_name)])
    if existing_items:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una especie con ese nombre científico.",
        )

    now_iso = datetime.utcnow().isoformat()
    document = {
        "name": name,
        "scientificName": scientific_name,
        "categoryIds": _normalize_catalog_category_ids(payload.get("categoryIds")),
        "iconType": "emoji",
        "iconEmoji": "🪴",
        "description": description,
        "origin": str(payload.get("origin") or "") or None,
        "climate": str(payload.get("climate") or "") or None,
        "growthTimeDays": None,
        "maxHeightCm": None,
        "floweringType": None,
        "isToxic": bool(payload.get("isToxic", False)),
        "waterAmountMl": None,
        "careFrequencyPerWeek": None,
        "fertilizerType": None,
        "fertilizerFrequencyDays": None,
        "lightNotes": str(payload.get("lightNotes") or "") or None,
        "generalCareNotes": str(payload.get("generalCareNotes") or "") or None,
        "difficulty": difficulty,
        "imageUrl": str(payload.get("imageUrl") or "") or None,
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    db = get_firestore_client()
    reference = db.collection("plantsCatalog").document()
    reference.set(document)
    return get_document("plantsCatalog", reference.id)


def get_user_profile_payload(user_id: str) -> dict[str, Any]:
    user = _normalize_user_payload(get_document("users", user_id))
    stats = _get_collection_safe("userStats", filters=[("userId", "==", user_id)], order_by="order")
    info_tiles = _get_collection_safe(
        "userInfoTiles",
        filters=[("userId", "==", user_id)],
        order_by="order",
    )
    categories = _get_collection_safe("categories", order_by="order")

    favorite_plant = None
    favorite_plant_catalog = None
    favorite_plant_id = user.get("favoritePlantId")

    if isinstance(favorite_plant_id, str) and favorite_plant_id:
        try:
            favorite_plant = _normalize_user_plant_payload(get_document("userPlants", favorite_plant_id))
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
    user_plants = _get_collection_safe("userPlants", filters=[("userId", "==", user_id)])

    tags = _get_collection_safe("plantTags", filters=[("userId", "==", user_id)], order_by="order")
    schedule = _get_collection_safe(
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
        normalized_user_plant = _normalize_user_plant_payload(user_plant)
        catalog_plant = None
        catalog_id = normalized_user_plant.get("plantCatalogId")

        if not isinstance(normalized_user_plant.get("id"), str):
            logger.warning("userPlant sin id valido. user_id=%s payload=%s", user_id, normalized_user_plant)
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

        plant_id = normalized_user_plant.get("id")
        items.append(
            {
            "userPlant": normalized_user_plant,
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
    user_plant = _normalize_user_plant_payload(get_document("userPlants", user_plant_id))

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

    tags = _get_collection_safe(
        "plantTags",
        filters=[("userPlantId", "==", user_plant_id)],
        order_by="order",
    )
    care_schedule = _get_collection_safe(
        "careSchedule",
        filters=[("userPlantId", "==", user_plant_id)],
        order_by="scheduledFor",
    )
    care_history = _get_collection_safe(
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
