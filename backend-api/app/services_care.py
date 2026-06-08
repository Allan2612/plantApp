import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException

from .firebase import get_firestore_client
from .models import CareRuleInput

logger = logging.getLogger(__name__)

_CARE_RULES = "careRules"
_CARE_SCHEDULE = "careSchedule"
_CARE_HISTORY = "careHistory"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _today_iso_date() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _parse_iso_date(value: str) -> datetime:
    # Acepta YYYY-MM-DD o ISO completo
    try:
        if "T" in value:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Fecha inválida: {value}") from exc


def create_care_rules_for_plant(
    user_id: str,
    user_plant_id: str,
    rules: list[CareRuleInput],
) -> list[dict[str, Any]]:
    db = get_firestore_client()
    saved: list[dict[str, Any]] = []
    today = _today_iso_date()
    for rule in rules:
        rule_id = uuid.uuid4().hex
        payload = {
            "id": rule_id,
            "userId": user_id,
            "userPlantId": user_plant_id,
            "type": rule.type,
            "intervalDays": rule.intervalDays,
            "notes": rule.notes,
            "anchorDate": rule.anchorDate or today,
            "lastGeneratedUntil": None,
            "active": True,
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }
        db.collection(_CARE_RULES).document(rule_id).set(payload)
        saved.append(payload)
    return saved


def materialize_pending_tasks(user_id: str, horizon_days: int = 30) -> int:
    db = get_firestore_client()
    rules = [
        snap
        for snap in db.collection(_CARE_RULES)
        .where("userId", "==", user_id)
        .stream()
        if snap.to_dict().get("active") is True
    ]

    end_date = datetime.now(timezone.utc).date() + timedelta(days=horizon_days)
    created = 0

    for rule_snap in rules:
        rule = rule_snap.to_dict()
        rule_id = rule_snap.id
        # Una regla con datos corruptos (intervalDays/anchorDate inválidos) no
        # debe tumbar todo el endpoint: se registra y se salta.
        try:
            interval = int(rule.get("intervalDays") or 0)
            if interval <= 0:
                continue

            anchor_raw = rule.get("anchorDate") or _today_iso_date()
            anchor = _parse_iso_date(anchor_raw).date()
            last_until_raw = rule.get("lastGeneratedUntil")
            if last_until_raw:
                cursor = _parse_iso_date(last_until_raw).date() + timedelta(days=interval)
                # Re-alinear al múltiplo de intervalo desde anchor
                delta_days = (cursor - anchor).days
                if delta_days < 0:
                    cursor = anchor
                else:
                    remainder = delta_days % interval
                    if remainder != 0:
                        cursor = cursor + timedelta(days=(interval - remainder))
            else:
                cursor = anchor

            while cursor <= end_date:
                scheduled_for = cursor.isoformat()
                doc_id = f"{rule_id}_{scheduled_for}"
                existing = db.collection(_CARE_SCHEDULE).document(doc_id).get()
                if not existing.exists:
                    db.collection(_CARE_SCHEDULE).document(doc_id).set({
                        "id": doc_id,
                        "userId": rule.get("userId"),
                        "userPlantId": rule.get("userPlantId"),
                        "type": rule.get("type"),
                        "status": "pending",
                        "scheduledFor": scheduled_for,
                        "notes": rule.get("notes"),
                        "ruleId": rule_id,
                        "createdAt": _now_iso(),
                        "updatedAt": _now_iso(),
                    })
                    created += 1
                cursor = cursor + timedelta(days=interval)

            db.collection(_CARE_RULES).document(rule_id).update({
                "lastGeneratedUntil": end_date.isoformat(),
                "updatedAt": _now_iso(),
            })
        except Exception:
            logger.exception(
                "Regla de cuidado inválida, se omite. rule_id=%s user_id=%s",
                rule_id,
                user_id,
            )
            continue

    return created


def complete_care_task(
    task_id: str,
    completed_at: str | None,
    notes: str | None,
    value: str | None,
) -> dict[str, Any]:
    db = get_firestore_client()
    task_snap = db.collection(_CARE_SCHEDULE).document(task_id).get()
    if not task_snap.exists:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    task = task_snap.to_dict()
    completed_iso = completed_at or _today_iso_date()

    db.collection(_CARE_SCHEDULE).document(task_id).update({
        "status": "completed",
        "notes": notes if notes is not None else task.get("notes"),
        "updatedAt": _now_iso(),
    })

    history_id = uuid.uuid4().hex
    history_payload = {
        "id": history_id,
        "userId": task.get("userId"),
        "userPlantId": task.get("userPlantId"),
        "type": task.get("type"),
        "value": value,
        "notes": notes,
        "completedAt": completed_iso,
        "createdAt": _now_iso(),
    }
    db.collection(_CARE_HISTORY).document(history_id).set(history_payload)

    next_task: dict[str, Any] | None = None
    rule_id = task.get("ruleId")
    if rule_id:
        rule_snap = db.collection(_CARE_RULES).document(rule_id).get()
        if rule_snap.exists:
            rule = rule_snap.to_dict()
            if rule.get("active") and int(rule.get("intervalDays") or 0) > 0:
                interval = int(rule["intervalDays"])
                base = _parse_iso_date(completed_iso).date()
                next_date = (base + timedelta(days=interval)).isoformat()
                next_doc_id = f"{rule_id}_{next_date}"
                existing = db.collection(_CARE_SCHEDULE).document(next_doc_id).get()
                if not existing.exists:
                    next_task = {
                        "id": next_doc_id,
                        "userId": rule.get("userId"),
                        "userPlantId": rule.get("userPlantId"),
                        "type": rule.get("type"),
                        "status": "pending",
                        "scheduledFor": next_date,
                        "notes": rule.get("notes"),
                        "ruleId": rule_id,
                        "createdAt": _now_iso(),
                        "updatedAt": _now_iso(),
                    }
                    db.collection(_CARE_SCHEDULE).document(next_doc_id).set(next_task)
                else:
                    next_task = existing.to_dict()
                    next_task["id"] = next_doc_id

    refreshed = db.collection(_CARE_SCHEDULE).document(task_id).get().to_dict()
    refreshed["id"] = task_id
    return {
        "task": refreshed,
        "history": history_payload,
        "next": next_task,
    }


def _delete_future_pending_tasks(rule_id: str) -> int:
    db = get_firestore_client()
    today = _today_iso_date()
    tasks = [
        snap
        for snap in db.collection(_CARE_SCHEDULE)
        .where("ruleId", "==", rule_id)
        .stream()
        if snap.to_dict().get("status") == "pending"
    ]
    deleted = 0
    for snap in tasks:
        data = snap.to_dict()
        if (data.get("scheduledFor") or "") >= today:
            db.collection(_CARE_SCHEDULE).document(snap.id).delete()
            deleted += 1
    return deleted


def update_care_rule(rule_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_firestore_client()
    snap = db.collection(_CARE_RULES).document(rule_id).get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Regla no encontrada")

    current = snap.to_dict()
    allowed = {"intervalDays", "notes", "anchorDate", "active"}
    update_data: dict[str, Any] = {}
    for key, value in payload.items():
        if key in allowed and value is not None:
            update_data[key] = value

    if not update_data:
        current["id"] = rule_id
        return current

    structural_change = any(
        k in update_data for k in ("intervalDays", "anchorDate", "active")
    )
    update_data["updatedAt"] = _now_iso()
    if "intervalDays" in update_data or "anchorDate" in update_data:
        update_data["lastGeneratedUntil"] = None  # forzar re-materialización

    db.collection(_CARE_RULES).document(rule_id).update(update_data)

    if structural_change:
        _delete_future_pending_tasks(rule_id)
        materialize_pending_tasks(current.get("userId"), horizon_days=30)

    final = db.collection(_CARE_RULES).document(rule_id).get().to_dict()
    final["id"] = rule_id
    return final


def delete_care_rule(rule_id: str) -> None:
    db = get_firestore_client()
    snap = db.collection(_CARE_RULES).document(rule_id).get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Regla no encontrada")

    db.collection(_CARE_RULES).document(rule_id).update({
        "active": False,
        "updatedAt": _now_iso(),
    })
    _delete_future_pending_tasks(rule_id)


def create_manual_care_task(payload: dict[str, Any]) -> dict[str, Any]:
    db = get_firestore_client()
    task_id = uuid.uuid4().hex
    doc = {
        "id": task_id,
        "userId": payload["userId"],
        "userPlantId": payload["userPlantId"],
        "type": payload["type"],
        "status": "pending",
        "scheduledFor": payload["scheduledFor"],
        "notes": payload.get("notes"),
        "ruleId": None,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    }
    db.collection(_CARE_SCHEDULE).document(task_id).set(doc)
    return doc


def update_care_task(task_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    db = get_firestore_client()
    snap = db.collection(_CARE_SCHEDULE).document(task_id).get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    allowed = {"scheduledFor", "notes", "status"}
    update_data = {k: v for k, v in payload.items() if k in allowed and v is not None}
    if update_data:
        update_data["updatedAt"] = _now_iso()
        db.collection(_CARE_SCHEDULE).document(task_id).update(update_data)

    final = db.collection(_CARE_SCHEDULE).document(task_id).get().to_dict()
    final["id"] = task_id
    return final


def delete_care_task(task_id: str) -> None:
    db = get_firestore_client()
    snap = db.collection(_CARE_SCHEDULE).document(task_id).get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    db.collection(_CARE_SCHEDULE).document(task_id).delete()


def list_care_rules_for_plant(user_plant_id: str) -> list[dict[str, Any]]:
    db = get_firestore_client()
    return [snap.to_dict() | {"id": snap.id} for snap in (
        db.collection(_CARE_RULES).where("userPlantId", "==", user_plant_id).stream()
    )]
