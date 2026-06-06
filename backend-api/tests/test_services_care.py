from datetime import datetime, timedelta, timezone

import pytest

from app.services_care import (
    _CARE_HISTORY,
    _CARE_RULES,
    _CARE_SCHEDULE,
    complete_care_task,
    create_care_rules_for_plant,
    create_manual_care_task,
    delete_care_rule,
    delete_care_task,
    list_care_rules_for_plant,
    materialize_pending_tasks,
    update_care_rule,
    update_care_task,
)
from app.models import CareRuleInput


def _seed_user_plant(fake_db, user_id="u1", plant_id="p1"):
    fake_db.collection("userPlants").document(plant_id).set({
        "userId": user_id,
        "nickname": "Test",
        "status": "active",
        "progress": 0,
        "favorite": False,
        "healthStatus": "good",
        "plantCatalogId": None,
    })


def test_materialize_pending_tasks_idempotent(fake_db):
    _seed_user_plant(fake_db)
    rules = [CareRuleInput(type="watering", intervalDays=3, notes="r1")]
    create_care_rules_for_plant("u1", "p1", rules)

    first = materialize_pending_tasks("u1", horizon_days=30)
    second = materialize_pending_tasks("u1", horizon_days=30)

    tasks = list(fake_db.collection("careSchedule")._docs.values())
    # +30 días con intervalo 3 → 11 ocurrencias (días 0,3,6,...,30 = 11)
    assert len(tasks) == 11
    assert first == 11
    assert second == 0  # segunda llamada no duplica


def test_materialize_creates_pending_only_for_active_rules(fake_db):
    _seed_user_plant(fake_db)
    rules = [
        CareRuleInput(type="watering", intervalDays=7),
        CareRuleInput(type="fertilizing", intervalDays=30),
    ]
    saved = create_care_rules_for_plant("u1", "p1", rules)

    # Desactivar la primera
    fake_db.collection("careRules").document(saved[0]["id"]).update({"active": False})

    materialize_pending_tasks("u1", horizon_days=30)
    tasks = list(fake_db.collection("careSchedule")._docs.values())
    types = {t["type"] for t in tasks}
    assert types == {"fertilizing"}


def test_materialize_doc_id_is_deterministic(fake_db):
    _seed_user_plant(fake_db)
    rules = [CareRuleInput(type="watering", intervalDays=5)]
    saved = create_care_rules_for_plant("u1", "p1", rules)
    rule_id = saved[0]["id"]

    materialize_pending_tasks("u1", horizon_days=10)
    docs = fake_db.collection("careSchedule")._docs
    # Cada doc-id debe ser `{ruleId}_{scheduledFor}`
    for doc_id, data in docs.items():
        assert doc_id == f"{rule_id}_{data['scheduledFor']}"


def test_complete_task_creates_history_and_next(fake_db):
    _seed_user_plant(fake_db)
    saved = create_care_rules_for_plant(
        "u1", "p1", [CareRuleInput(type="watering", intervalDays=4)]
    )
    rule_id = saved[0]["id"]
    materialize_pending_tasks("u1", horizon_days=10)

    # Tomar primera tarea pending
    tasks = sorted(
        fake_db.collection(_CARE_SCHEDULE)._docs.items(),
        key=lambda kv: kv[1]["scheduledFor"],
    )
    first_task_id = tasks[0][0]

    result = complete_care_task(first_task_id, completed_at="2026-05-27", notes="OK", value=None)

    # task ahora completed
    completed = fake_db.collection(_CARE_SCHEDULE)._docs[first_task_id]
    assert completed["status"] == "completed"

    # history entry creada
    history = list(fake_db.collection(_CARE_HISTORY)._docs.values())
    assert len(history) == 1
    assert history[0]["userPlantId"] == "p1"
    assert history[0]["completedAt"] == "2026-05-27"

    # próxima tarea creada a +4 días
    assert result["next"] is not None
    assert result["next"]["scheduledFor"] == "2026-05-31"
    assert result["next"]["ruleId"] == rule_id


def test_complete_task_without_rule_does_not_create_next(fake_db):
    # Tarea manual sin ruleId
    fake_db.collection(_CARE_SCHEDULE).document("manual-1").set({
        "id": "manual-1",
        "userId": "u1",
        "userPlantId": "p1",
        "type": "pruning",
        "status": "pending",
        "scheduledFor": "2026-05-27",
        "notes": None,
        "ruleId": None,
    })
    result = complete_care_task("manual-1", completed_at="2026-05-27", notes=None, value=None)
    assert result["next"] is None


def test_update_rule_regenerates_future_pending(fake_db):
    _seed_user_plant(fake_db)
    saved = create_care_rules_for_plant(
        "u1", "p1", [CareRuleInput(type="watering", intervalDays=7)]
    )
    rule_id = saved[0]["id"]
    materialize_pending_tasks("u1", horizon_days=30)
    before = len(fake_db.collection(_CARE_SCHEDULE)._docs)

    update_care_rule(rule_id, {"intervalDays": 3})

    rule_after = fake_db.collection(_CARE_RULES)._docs[rule_id]
    assert rule_after["intervalDays"] == 3
    # Después de re-materializar con interval 3, debería haber más tareas
    after = len(fake_db.collection(_CARE_SCHEDULE)._docs)
    assert after > before


def test_delete_rule_deactivates_and_removes_future_pending(fake_db):
    _seed_user_plant(fake_db)
    saved = create_care_rules_for_plant(
        "u1", "p1", [CareRuleInput(type="watering", intervalDays=5)]
    )
    rule_id = saved[0]["id"]
    materialize_pending_tasks("u1", horizon_days=20)

    # Marcar primera como completed para verificar que NO se borra
    tasks = sorted(
        fake_db.collection(_CARE_SCHEDULE)._docs.items(),
        key=lambda kv: kv[1]["scheduledFor"],
    )
    fake_db.collection(_CARE_SCHEDULE).document(tasks[0][0]).update({"status": "completed"})

    delete_care_rule(rule_id)

    rule_after = fake_db.collection(_CARE_RULES)._docs[rule_id]
    assert rule_after["active"] is False

    remaining = fake_db.collection(_CARE_SCHEDULE)._docs
    statuses = {data["status"] for data in remaining.values()}
    # Solo completed sobrevive
    assert statuses == {"completed"}


def test_create_manual_care_task(fake_db):
    task = create_manual_care_task({
        "userId": "u1",
        "userPlantId": "p1",
        "type": "pruning",
        "scheduledFor": "2026-06-01",
        "notes": "tip",
    })
    assert task["status"] == "pending"
    assert task["ruleId"] is None


def test_update_and_delete_care_task(fake_db):
    task = create_manual_care_task({
        "userId": "u1", "userPlantId": "p1",
        "type": "rotation", "scheduledFor": "2026-06-01",
    })
    updated = update_care_task(task["id"], {"status": "skipped"})
    assert updated["status"] == "skipped"
    delete_care_task(task["id"])
    assert task["id"] not in fake_db.collection(_CARE_SCHEDULE)._docs


def test_list_care_rules_for_plant(fake_db):
    _seed_user_plant(fake_db)
    create_care_rules_for_plant("u1", "p1", [
        CareRuleInput(type="watering", intervalDays=3),
        CareRuleInput(type="fertilizing", intervalDays=30),
    ])
    rules = list_care_rules_for_plant("p1")
    assert len(rules) == 2


def test_create_user_plant_with_care_rules_materializes(fake_db):
    from app.services import create_user_plant

    # Seed user doc (create_user_plant requires it)
    fake_db.collection("users").document("u1").set({
        "id": "u1",
        "email": "u1@test.com",
        "displayName": "U1",
        "firstName": "U",
        "lastName": "One",
        "username": "u1",
        "avatarId": "a",
        "provider": "password",
        "acceptedTerms": True,
        "visibility": "public",
        "streakDays": 0,
        "streakText": "",
        "favoritePlantId": None,
        "themePreference": "system",
        "status": "active",
        "plantCount": 0,
    })

    payload = {
        "userId": "u1",
        "nickname": "Test plant",
        "plantCatalogId": None,
        "healthStatus": "good",
        "locationHome": None,
        "acquiredDate": None,
        "notes": None,
        "customImageUrl": None,
        "favorite": False,
        "careRules": [
            {"type": "watering", "intervalDays": 5, "notes": None, "anchorDate": None},
        ],
    }
    plant = create_user_plant(payload)
    assert plant["userId"] == "u1"

    rules = list(fake_db.collection(_CARE_RULES)._docs.values())
    assert len(rules) == 1

    tasks = list(fake_db.collection(_CARE_SCHEDULE)._docs.values())
    assert len(tasks) > 0  # materialized
