# Módulo Calendario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el módulo de calendario de cuidados completo: reglas de cuidado por planta, materialización de tareas con +30 días, vista calendario mensual + agenda diaria, notificaciones locales, e integración con la IA de identificación.

**Architecture:** Backend FastAPI/Firestore agrega colecciones `careRules` + extiende `careSchedule` con `ruleId`. Servicio `services_care.py` materializa tareas idempotentemente (`{ruleId}_{scheduledFor}` como doc-id). Mobile añade feature `calendario/` con Zustand store, cache AsyncStorage, cola offline, y `expo-notifications` locales. IA Groq devuelve `care_schedule` estructurado que el SavePlantSheet envía al backend.

**Tech Stack:** FastAPI + Firestore + Pydantic v2 + pytest (backend); Expo SDK 54 + React Native 0.81 + Zustand + AsyncStorage + expo-notifications + Ionicons (mobile); Groq Llama (IA).

**Spec:** `docs/superpowers/specs/2026-05-27-calendario-module-design.md`

---

## Pre-flight setup

### Task 0: Instalar dependencias

**Files:**
- Modify: `backend-api/requirements.txt`
- Modify: `mobile/package.json` (via npm)
- Modify: `mobile/app.json`

- [ ] **Step 0.1: Backend — agregar pytest + pytest-mock**

Edit `backend-api/requirements.txt` añadiendo al final:
```
pytest==8.3.4
pytest-mock==3.14.0
```

Run: `cd backend-api && .venv\Scripts\pip install -r requirements.txt`
Expected: `Successfully installed pytest-8.3.4 pytest-mock-3.14.0` (u otras versiones compatibles).

- [ ] **Step 0.2: Mobile — instalar `expo-notifications`**

Run: `cd mobile && npx expo install expo-notifications`
Expected: dependencia añadida en `package.json` con versión compatible SDK 54.

- [ ] **Step 0.3: Mobile — configurar plugin en `app.json`**

En `mobile/app.json`, dentro de `"expo".plugins`, añadir:
```json
[
  "expo-notifications",
  {
    "icon": "./assets/notification-icon.png",
    "color": "#22c55e"
  }
]
```

Nota: si `./assets/notification-icon.png` no existe, dejar la entry con solo el plugin string `"expo-notifications"` (icon usa default). Documentar en el commit.

- [ ] **Step 0.4: Commit**

```bash
cd c:\Users\alanv\OneDrive\Documentos\Allan\Mobiles\plantApp
git add backend-api/requirements.txt mobile/package.json mobile/package-lock.json mobile/app.json
git commit -m "chore(calendario): add pytest + expo-notifications deps"
```

---

## Phase 1: Backend — modelos y configuración base

### Task 1: Crear conftest.py y test scaffold

**Files:**
- Create: `backend-api/tests/__init__.py`
- Create: `backend-api/tests/conftest.py`
- Create: `backend-api/pytest.ini`

- [ ] **Step 1.1: Crear `pytest.ini`**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

- [ ] **Step 1.2: Crear `tests/__init__.py`** (archivo vacío)

```python
```

- [ ] **Step 1.3: Crear `tests/conftest.py` con FakeFirestore**

```python
"""Test fixtures con FakeFirestore en memoria para evitar tocar Firebase real."""
import pytest
from typing import Any


class FakeDocSnapshot:
    def __init__(self, doc_id: str, data: dict | None):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self) -> dict:
        return dict(self._data or {})


class FakeDocRef:
    def __init__(self, collection: "FakeCollection", doc_id: str):
        self._collection = collection
        self.id = doc_id

    def set(self, data: dict, merge: bool = False) -> None:
        existing = self._collection._docs.get(self.id, {}) if merge else {}
        self._collection._docs[self.id] = {**existing, **data}

    def update(self, data: dict) -> None:
        existing = self._collection._docs.get(self.id, {})
        self._collection._docs[self.id] = {**existing, **data}

    def delete(self) -> None:
        self._collection._docs.pop(self.id, None)

    def get(self) -> FakeDocSnapshot:
        return FakeDocSnapshot(self.id, self._collection._docs.get(self.id))


class FakeQuery:
    def __init__(self, collection: "FakeCollection"):
        self._collection = collection
        self._filters: list[tuple[str, str, Any]] = []
        self._order_by: str | None = None

    def where(self, field: str, op: str, value: Any) -> "FakeQuery":
        new = FakeQuery(self._collection)
        new._filters = self._filters + [(field, op, value)]
        new._order_by = self._order_by
        return new

    def order_by(self, field: str) -> "FakeQuery":
        new = FakeQuery(self._collection)
        new._filters = self._filters
        new._order_by = field
        return new

    def stream(self):
        results = []
        for doc_id, data in self._collection._docs.items():
            ok = True
            for field, op, value in self._filters:
                actual = data.get(field)
                if op == "==" and actual != value:
                    ok = False
                    break
                if op == "!=" and actual == value:
                    ok = False
                    break
            if ok:
                results.append(FakeDocSnapshot(doc_id, data))
        if self._order_by:
            results.sort(key=lambda s: str(s.to_dict().get(self._order_by, "") or ""))
        return iter(results)


class FakeCollection:
    def __init__(self):
        self._docs: dict[str, dict] = {}

    def document(self, doc_id: str | None = None) -> FakeDocRef:
        if doc_id is None:
            import uuid
            doc_id = uuid.uuid4().hex
        return FakeDocRef(self, doc_id)

    def where(self, field: str, op: str, value: Any) -> FakeQuery:
        return FakeQuery(self).where(field, op, value)

    def order_by(self, field: str) -> FakeQuery:
        return FakeQuery(self).order_by(field)

    def stream(self):
        return FakeQuery(self).stream()


class FakeFirestore:
    def __init__(self):
        self._collections: dict[str, FakeCollection] = {}

    def collection(self, name: str) -> FakeCollection:
        if name not in self._collections:
            self._collections[name] = FakeCollection()
        return self._collections[name]


@pytest.fixture
def fake_db(monkeypatch):
    db = FakeFirestore()
    from app import firebase as firebase_mod
    monkeypatch.setattr(firebase_mod, "get_firestore_client", lambda: db)
    from app import services as services_mod
    monkeypatch.setattr(services_mod, "get_firestore_client", lambda: db)
    return db
```

- [ ] **Step 1.4: Verificar pytest descubre tests**

Run: `cd backend-api && .venv\Scripts\python -m pytest --collect-only`
Expected: `no tests ran` (sin errores de import).

- [ ] **Step 1.5: Commit**

```bash
git add backend-api/tests backend-api/pytest.ini
git commit -m "test(backend): pytest scaffold with FakeFirestore fixture"
```

### Task 2: Modelos Pydantic de care rules y requests

**Files:**
- Modify: `backend-api/app/models.py`
- Create: `backend-api/tests/test_models.py`

- [ ] **Step 2.1: Escribir test fallido para `CareRuleInput` validation**

Crear `backend-api/tests/test_models.py`:
```python
import pytest
from pydantic import ValidationError

from app.models import (
    CareRuleInput,
    CompleteCareTaskRequest,
    CreateCareTaskRequest,
    UpdateCareTaskRequest,
)


def test_care_rule_input_valid():
    rule = CareRuleInput(type="watering", intervalDays=3, notes="ok")
    assert rule.type == "watering"
    assert rule.intervalDays == 3
    assert rule.anchorDate is None


def test_care_rule_input_invalid_type_rejected():
    with pytest.raises(ValidationError):
        CareRuleInput(type="alien", intervalDays=3)


def test_care_rule_input_extra_field_rejected():
    with pytest.raises(ValidationError):
        CareRuleInput(type="watering", intervalDays=3, evil="x")


def test_create_care_task_request_minimum():
    req = CreateCareTaskRequest(
        userId="u1", userPlantId="p1", type="pruning", scheduledFor="2026-06-01"
    )
    assert req.userPlantId == "p1"
    assert req.notes is None


def test_update_care_task_request_all_optional():
    req = UpdateCareTaskRequest()
    assert req.scheduledFor is None
    assert req.status is None


def test_complete_care_task_request_all_optional():
    req = CompleteCareTaskRequest()
    assert req.completedAt is None
```

- [ ] **Step 2.2: Run test, verify fail**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_models.py -v`
Expected: `ImportError` para `CareRuleInput` (no existe aún).

- [ ] **Step 2.3: Implementar modelos**

Editar `backend-api/app/models.py`. Después de `CareHistoryItemModel` (línea ~243) añadir:

```python
class CareRuleModel(FirestoreBaseModel):
    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    intervalDays: int
    notes: str | None = None
    anchorDate: str
    lastGeneratedUntil: str | None = None
    active: bool = True


class CareRuleInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    intervalDays: int
    notes: str | None = None
    anchorDate: str | None = None


class CompleteCareTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    completedAt: str | None = None
    notes: str | None = None
    value: str | None = None


class CreateCareTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    scheduledFor: str
    notes: str | None = None


class UpdateCareTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scheduledFor: str | None = None
    notes: str | None = None
    status: Literal["pending", "completed", "skipped"] | None = None
```

Además, en `CareScheduleItemModel` añadir `ruleId: str | None = None`:
```python
class CareScheduleItemModel(FirestoreBaseModel):
    userId: str
    userPlantId: str
    type: Literal["watering", "fertilizing", "pruning", "rotation"]
    status: Literal["pending", "completed", "skipped"]
    scheduledFor: str
    notes: str | None = None
    ruleId: str | None = None
```

En `CreateUserPlantRequest` añadir campo:
```python
    careRules: list["CareRuleInput"] | None = None
```
(quedará al final, antes de la próxima clase; usa forward ref si necesario o reordena para que `CareRuleInput` esté declarado antes).

En `PlantIdentificationResponse` añadir:
```python
    care_schedule: list["CareRuleInput"] = Field(default_factory=list)
```

**Importante:** mover declaración de `CareRuleInput` ANTES de `CreateUserPlantRequest` y `PlantIdentificationResponse` para evitar problemas de forward references.

- [ ] **Step 2.4: Run tests, verify pass**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_models.py -v`
Expected: 5 tests PASSED.

- [ ] **Step 2.5: Commit**

```bash
git add backend-api/app/models.py backend-api/tests/test_models.py
git commit -m "feat(backend): add care rules + task request models"
```

---

## Phase 2: Backend — Care engine (services_care.py)

### Task 3: Materialización idempotente

**Files:**
- Create: `backend-api/app/services_care.py`
- Create: `backend-api/tests/test_services_care.py`

- [ ] **Step 3.1: Escribir test fallido para `materialize_pending_tasks` idempotente**

Crear `backend-api/tests/test_services_care.py`:
```python
from datetime import datetime, timedelta, timezone

import pytest

from app.services_care import (
    create_care_rules_for_plant,
    materialize_pending_tasks,
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
```

- [ ] **Step 3.2: Run, verify fail**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py -v`
Expected: `ImportError` (services_care no existe).

- [ ] **Step 3.3: Implementar `services_care.py` mínimo**

Crear `backend-api/app/services_care.py`:
```python
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
    rules = list(
        db.collection(_CARE_RULES)
        .where("userId", "==", user_id)
        .where("active", "==", True)
        .stream()
    )

    end_date = datetime.now(timezone.utc).date() + timedelta(days=horizon_days)
    created = 0

    for rule_snap in rules:
        rule = rule_snap.to_dict()
        rule_id = rule_snap.id
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

    return created
```

- [ ] **Step 3.4: Run tests, verify pass**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py -v`
Expected: 3 tests PASSED.

- [ ] **Step 3.5: Commit**

```bash
git add backend-api/app/services_care.py backend-api/tests/test_services_care.py
git commit -m "feat(backend): care engine — create rules + idempotent materialization"
```

### Task 4: Completar tarea y regenerar próxima

**Files:**
- Modify: `backend-api/app/services_care.py`
- Modify: `backend-api/tests/test_services_care.py`

- [ ] **Step 4.1: Escribir test fallido para `complete_care_task`**

Añadir a `tests/test_services_care.py`:
```python
from app.services_care import complete_care_task


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
```

- [ ] **Step 4.2: Run, verify fail**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py::test_complete_task_creates_history_and_next -v`
Expected: `AttributeError` (no `complete_care_task`).

- [ ] **Step 4.3: Implementar `complete_care_task`**

Añadir al final de `backend-api/app/services_care.py`:
```python
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
```

- [ ] **Step 4.4: Run tests, verify pass**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py -v`
Expected: 5 tests PASSED.

- [ ] **Step 4.5: Commit**

```bash
git add backend-api/app/services_care.py backend-api/tests/test_services_care.py
git commit -m "feat(backend): complete_care_task with history + next task"
```

### Task 5: Update y delete de reglas

**Files:**
- Modify: `backend-api/app/services_care.py`
- Modify: `backend-api/tests/test_services_care.py`

- [ ] **Step 5.1: Escribir tests fallidos**

Añadir a `tests/test_services_care.py`:
```python
from app.services_care import delete_care_rule, update_care_rule


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
```

- [ ] **Step 5.2: Run, verify fail**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py -v`
Expected: 2 tests FAIL con `ImportError` o `AttributeError`.

- [ ] **Step 5.3: Implementar `update_care_rule` y `delete_care_rule`**

Añadir al final de `backend-api/app/services_care.py`:
```python
def _delete_future_pending_tasks(rule_id: str) -> int:
    db = get_firestore_client()
    today = _today_iso_date()
    tasks = list(
        db.collection(_CARE_SCHEDULE)
        .where("ruleId", "==", rule_id)
        .where("status", "==", "pending")
        .stream()
    )
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
```

- [ ] **Step 5.4: Run tests, verify pass**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py -v`
Expected: 7 tests PASSED.

- [ ] **Step 5.5: Commit**

```bash
git add backend-api/app/services_care.py backend-api/tests/test_services_care.py
git commit -m "feat(backend): update + delete care rule with future-task regen"
```

### Task 6: Helpers de tarea manual (create/update/delete schedule)

**Files:**
- Modify: `backend-api/app/services_care.py`

- [ ] **Step 6.1: Implementar create/update/delete task helpers**

Añadir al final de `backend-api/app/services_care.py`:
```python
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
```

- [ ] **Step 6.2: Añadir tests rápidos**

Añadir a `tests/test_services_care.py`:
```python
from app.services_care import (
    create_manual_care_task,
    delete_care_task,
    list_care_rules_for_plant,
    update_care_task,
)


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
```

- [ ] **Step 6.3: Run tests**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py -v`
Expected: 10 tests PASSED.

- [ ] **Step 6.4: Commit**

```bash
git add backend-api/app/services_care.py backend-api/tests/test_services_care.py
git commit -m "feat(backend): manual task CRUD + list rules helpers"
```

---

## Phase 3: Backend — Endpoints

### Task 7: Endpoints de care rules y schedule

**Files:**
- Modify: `backend-api/app/routes.py`

- [ ] **Step 7.1: Importar nuevos modelos y servicios**

Editar imports al inicio de `backend-api/app/routes.py`. En el bloque `from .models import (...)` añadir:
```python
    CareRuleInput,
    CareRuleModel,
    CompleteCareTaskRequest,
    CreateCareTaskRequest,
    UpdateCareTaskRequest,
```

En el bloque `from .services import (...)` mantener. Añadir nuevo bloque:
```python
from .services_care import (
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
```

- [ ] **Step 7.2: Modificar `read_user_care_schedule` para materializar + filtrar**

Reemplazar el endpoint existente `read_user_care_schedule` (línea ~339) por:
```python
@router.get("/api/users/{user_id}/care-schedule", response_model=list[CareScheduleItemModel])
def read_user_care_schedule(
    user_id: str,
    from_date: str | None = None,
    to_date: str | None = None,
) -> list[dict]:
    validated_user_id = _validate_required_id(user_id, "user_id")
    try:
        materialize_pending_tasks(validated_user_id, horizon_days=30)
        items = get_collection(
            "careSchedule",
            filters=[("userId", "==", validated_user_id)],
            order_by="scheduledFor",
        )
        if from_date:
            items = [it for it in items if (it.get("scheduledFor") or "") >= from_date]
        if to_date:
            items = [it for it in items if (it.get("scheduledFor") or "") <= to_date]
        return items
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "Error inesperado en read_user_care_schedule. user_id=%s",
            validated_user_id,
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")
```

Nota: FastAPI mapea `from_date`/`to_date` desde query params `?from_date=...&to_date=...`. Cliente debe usar esos nombres.

- [ ] **Step 7.3: Añadir endpoints de care rules**

Después del endpoint `read_user_care_schedule`, añadir:
```python
@router.get(
    "/api/user-plants/{user_plant_id}/care-rules",
    response_model=list[CareRuleModel],
)
def read_care_rules(user_plant_id: str) -> list[dict]:
    validated = _validate_required_id(user_plant_id, "user_plant_id")
    try:
        return list_care_rules_for_plant(validated)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en read_care_rules. user_plant_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post(
    "/api/user-plants/{user_plant_id}/care-rules",
    response_model=CareRuleModel,
)
def post_care_rule(user_plant_id: str, payload: CareRuleInput) -> dict:
    validated = _validate_required_id(user_plant_id, "user_plant_id")
    try:
        # Recupera userId desde la planta
        plant = get_document("userPlants", validated)
        user_id = plant.get("userId")
        if not user_id:
            raise HTTPException(status_code=400, detail="planta sin userId")
        rules = create_care_rules_for_plant(user_id, validated, [payload])
        materialize_pending_tasks(user_id, horizon_days=30)
        return rules[0]
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en post_care_rule. user_plant_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.patch("/api/care-rules/{rule_id}", response_model=CareRuleModel)
def patch_care_rule(rule_id: str, payload: dict) -> dict:
    validated = _validate_required_id(rule_id, "rule_id")
    try:
        return update_care_rule(validated, payload)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en patch_care_rule. rule_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.delete("/api/care-rules/{rule_id}")
def delete_care_rule_endpoint(rule_id: str) -> dict:
    validated = _validate_required_id(rule_id, "rule_id")
    try:
        delete_care_rule(validated)
        return {"ok": True}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en delete_care_rule. rule_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")
```

- [ ] **Step 7.4: Añadir endpoints de care tasks**

Añadir después:
```python
@router.post("/api/care-schedule", response_model=CareScheduleItemModel)
def post_care_task(payload: CreateCareTaskRequest) -> dict:
    try:
        return create_manual_care_task(payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en post_care_task")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.patch("/api/care-schedule/{task_id}", response_model=CareScheduleItemModel)
def patch_care_task(task_id: str, payload: UpdateCareTaskRequest) -> dict:
    validated = _validate_required_id(task_id, "task_id")
    try:
        return update_care_task(validated, payload.model_dump())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en patch_care_task. task_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.delete("/api/care-schedule/{task_id}")
def delete_care_task_endpoint(task_id: str) -> dict:
    validated = _validate_required_id(task_id, "task_id")
    try:
        delete_care_task(validated)
        return {"ok": True}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en delete_care_task. task_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/care-schedule/{task_id}/complete")
def post_complete_task(task_id: str, payload: CompleteCareTaskRequest) -> dict:
    validated = _validate_required_id(task_id, "task_id")
    try:
        return complete_care_task(
            validated,
            completed_at=payload.completedAt,
            notes=payload.notes,
            value=payload.value,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error en post_complete_task. task_id=%s", validated)
        raise HTTPException(status_code=500, detail="Error interno del servidor")
```

- [ ] **Step 7.5: Verificar arranque servidor**

Run: `cd backend-api && .venv\Scripts\python -m uvicorn app:app --reload --port 8000`
Expected: arranque OK, sin errores de import. Detener con Ctrl+C.

- [ ] **Step 7.6: Commit**

```bash
git add backend-api/app/routes.py
git commit -m "feat(backend): endpoints care-rules + care-schedule + complete"
```

### Task 8: Integrar `careRules` en POST /api/user-plants

**Files:**
- Modify: `backend-api/app/services.py`

- [ ] **Step 8.1: Localizar `create_user_plant`**

Run: `Grep -n "def create_user_plant" backend-api/app/services.py`
Esperado: una sola definición.

- [ ] **Step 8.2: Modificar `create_user_plant` para procesar `careRules`**

Editar `backend-api/app/services.py`. Localizar la función `create_user_plant`. Al final del cuerpo (justo antes de retornar el dict del plant) añadir:
```python
    # Procesar careRules opcionales que vinieron en payload
    care_rules_raw = payload.get("careRules") or []
    if care_rules_raw:
        from .services_care import (
            create_care_rules_for_plant,
            materialize_pending_tasks,
        )
        from .models import CareRuleInput
        validated_rules = [CareRuleInput(**rule) for rule in care_rules_raw]
        create_care_rules_for_plant(
            user_id=payload["userId"],
            user_plant_id=new_plant_id,  # ajustar nombre real de variable
            rules=validated_rules,
        )
        materialize_pending_tasks(payload["userId"], horizon_days=30)
```

**Importante:** lee primero la función para identificar el nombre exacto de la variable que contiene el id del nuevo plant; reemplaza `new_plant_id` por ese nombre. Si la función no tiene esa variable, asignar a partir del doc creado (usar `doc_ref.id` o equivalente).

- [ ] **Step 8.3: Test de integración**

Añadir a `tests/test_services_care.py`:
```python
from app.services import create_user_plant


def test_create_user_plant_with_care_rules_materializes(fake_db):
    payload = {
        "userId": "u1",
        "nickname": "Test",
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
    assert len(tasks) > 0  # se materializaron
```

- [ ] **Step 8.4: Run, ajustar si falla**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_care.py::test_create_user_plant_with_care_rules_materializes -v`
Si falla por estructura de `create_user_plant` (campos faltantes en payload), ajustar payload de test para que matchee la firma real.
Expected: PASS.

- [ ] **Step 8.5: Commit**

```bash
git add backend-api/app/services.py backend-api/tests/test_services_care.py
git commit -m "feat(backend): create_user_plant materializes careRules"
```

---

## Phase 4: Backend — IA prompt extendido

### Task 9: Extender prompt Groq con `care_schedule`

**Files:**
- Modify: `backend-api/app/services_ai.py`
- Create: `backend-api/tests/test_services_ai.py`

- [ ] **Step 9.1: Test fallido para validación de `care_schedule`**

Crear `backend-api/tests/test_services_ai.py`:
```python
import json
from unittest.mock import patch, MagicMock

from app.services_ai import identify_plant_from_base64


def _mock_groq_response(content_json: dict):
    response = MagicMock()
    response.ok = True
    response.status_code = 200
    response.json.return_value = {
        "choices": [{"message": {"content": json.dumps(content_json)}}]
    }
    return response


def test_care_schedule_returned_in_response(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "x")
    payload = {
        "is_plant": True,
        "confidence": 0.9,
        "common_name": "Monstera",
        "scientific_name": "Monstera deliciosa",
        "nicknames": [],
        "description": "x",
        "care_summary": "x",
        "watering_notes": "x",
        "light_notes": "x",
        "difficulty": "easy",
        "is_toxic": False,
        "care_schedule": [
            {"type": "watering", "intervalDays": 3, "notes": "ok"},
            {"type": "fertilizing", "intervalDays": 30, "notes": None},
        ],
    }
    with patch("app.services_ai.requests.post", return_value=_mock_groq_response(payload)):
        result = identify_plant_from_base64("base64xxx", "")
    assert len(result["care_schedule"]) == 2
    assert result["care_schedule"][0]["intervalDays"] == 3


def test_care_schedule_filters_invalid_types(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "x")
    payload = {
        "is_plant": True,
        "confidence": 0.9,
        "common_name": "X",
        "scientific_name": "X",
        "nicknames": [],
        "description": None,
        "care_summary": None,
        "watering_notes": None,
        "light_notes": None,
        "difficulty": "easy",
        "is_toxic": False,
        "care_schedule": [
            {"type": "alien", "intervalDays": 3},
            {"type": "watering", "intervalDays": 500},  # clamp a 365
            {"type": "watering", "intervalDays": 0},    # descartar
            {"type": "watering", "intervalDays": 7},    # válido
        ],
    }
    with patch("app.services_ai.requests.post", return_value=_mock_groq_response(payload)):
        result = identify_plant_from_base64("base64xxx", "")
    # debe quedar: clamp 365 + válido 7 = 2 items
    assert len(result["care_schedule"]) == 2
    intervals = sorted(r["intervalDays"] for r in result["care_schedule"])
    assert intervals == [7, 365]


def test_care_schedule_empty_when_missing(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "x")
    payload = {
        "is_plant": False,
        "confidence": 0.0,
        "common_name": None,
        "scientific_name": None,
        "nicknames": [],
        "description": None,
        "care_summary": None,
        "watering_notes": None,
        "light_notes": None,
        "difficulty": None,
        "is_toxic": None,
    }
    with patch("app.services_ai.requests.post", return_value=_mock_groq_response(payload)):
        result = identify_plant_from_base64("base64xxx", "")
    assert result["care_schedule"] == []
```

- [ ] **Step 9.2: Run, verify fail**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_ai.py -v`
Expected: 3 fails — el response actual no incluye `care_schedule`.

- [ ] **Step 9.3: Modificar prompt y validación**

Editar `backend-api/app/services_ai.py`. Reemplazar `_IDENTIFICATION_PROMPT` añadiendo el bloque `care_schedule`:

```python
_IDENTIFICATION_PROMPT = """
Eres un experto en botánica e identificación de plantas. Analiza la imagen proporcionada.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.
Usa exactamente este formato:

{
  "is_plant": true,
  "confidence": 0.92,
  "common_name": "Monstera",
  "scientific_name": "Monstera deliciosa",
  "nicknames": ["Costilla de Adán", "Piñanona", "Cerimán"],
  "description": "Planta tropical de interior con grandes hojas características.",
  "care_summary": "Riego moderado, luz indirecta brillante, temperatura 18-30°C.",
  "watering_notes": "Regar cuando el sustrato esté seco en los primeros 3 cm.",
  "light_notes": "Luz indirecta brillante. Tolera sombra parcial.",
  "difficulty": "easy",
  "is_toxic": true,
  "care_schedule": [
    {"type": "watering", "intervalDays": 3, "notes": "Cuando el sustrato esté seco 3cm"},
    {"type": "fertilizing", "intervalDays": 30, "notes": "NPK balanceado primavera/verano"}
  ]
}

Si la imagen NO contiene una planta, responde con:
{"is_plant": false, "confidence": 0.0, "common_name": null, "scientific_name": null, "nicknames": [], "description": null, "care_summary": null, "watering_notes": null, "light_notes": null, "difficulty": null, "is_toxic": null, "care_schedule": []}

Reglas:
- confidence: valor entre 0.0 y 1.0
- difficulty: solo "easy", "medium" o "hard"
- nicknames: array de 2 a 5 apodos en español; si no hay, []
- care_schedule: lista de cuidados recurrentes aplicables a la especie.
  * type debe ser uno de: "watering", "fertilizing", "pruning", "rotation"
  * intervalDays entero entre 1 y 365 (frecuencia recomendada)
  * notes opcional, breve y útil
  * Incluye solo los cuidados realmente aplicables; no fuerces 4
  * Si is_plant=false, devuelve []
- Responde SOLO el JSON, absolutamente nada más
"""
```

Cambiar `"max_tokens": 1024` a `"max_tokens": 1536`.

Al final de `identify_plant_from_base64`, después del bloque de `nicknames`, añadir antes del `return result`:
```python
    raw_schedule = result.get("care_schedule")
    valid_types = {"watering", "fertilizing", "pruning", "rotation"}
    cleaned_schedule: list[dict] = []
    if isinstance(raw_schedule, list):
        for entry in raw_schedule:
            if not isinstance(entry, dict):
                continue
            entry_type = entry.get("type")
            if entry_type not in valid_types:
                continue
            interval_raw = entry.get("intervalDays")
            try:
                interval = int(interval_raw)
            except (TypeError, ValueError):
                continue
            if interval < 1:
                continue
            interval = min(interval, 365)
            notes = entry.get("notes")
            if isinstance(notes, str):
                notes = notes.strip() or None
            else:
                notes = None
            cleaned_schedule.append({
                "type": entry_type,
                "intervalDays": interval,
                "notes": notes,
                "anchorDate": None,
            })
    result["care_schedule"] = cleaned_schedule
```

- [ ] **Step 9.4: Run tests, verify pass**

Run: `cd backend-api && .venv\Scripts\python -m pytest tests/test_services_ai.py -v`
Expected: 3 tests PASSED.

- [ ] **Step 9.5: Commit**

```bash
git add backend-api/app/services_ai.py backend-api/tests/test_services_ai.py
git commit -m "feat(backend): IA returns structured care_schedule"
```

---

## Phase 5: Mobile — fundación

### Task 10: Tipos compartidos + careTypes util

**Files:**
- Create: `mobile/src/features/calendario/types.ts`
- Create: `mobile/src/features/calendario/utils/careTypes.ts`
- Create: `mobile/src/features/calendario/utils/dateRange.ts`

- [ ] **Step 10.1: Crear `types.ts`**

```typescript
export type CareTaskType = "watering" | "fertilizing" | "pruning" | "rotation";
export type CareTaskStatus = "pending" | "completed" | "skipped";

export interface CareScheduleItem {
  id: string;
  userId: string;
  userPlantId: string;
  type: CareTaskType;
  status: CareTaskStatus;
  scheduledFor: string;     // YYYY-MM-DD
  notes: string | null;
  ruleId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareRule {
  id: string;
  userId: string;
  userPlantId: string;
  type: CareTaskType;
  intervalDays: number;
  notes: string | null;
  anchorDate: string;
  lastGeneratedUntil: string | null;
  active: boolean;
}

export interface CareRuleInput {
  type: CareTaskType;
  intervalDays: number;
  notes?: string | null;
  anchorDate?: string | null;
}

export interface CompleteTaskResult {
  task: CareScheduleItem;
  history: { id: string; completedAt: string };
  next: CareScheduleItem | null;
}

export type QueuedAction =
  | { kind: "create"; payload: Omit<CareScheduleItem, "id" | "createdAt" | "updatedAt"> }
  | { kind: "update"; taskId: string; payload: Partial<CareScheduleItem> }
  | { kind: "delete"; taskId: string }
  | { kind: "complete"; taskId: string; completedAt: string; notes: string | null };
```

- [ ] **Step 10.2: Crear `careTypes.ts`**

```typescript
import type { CareTaskType } from "../types";

export interface CareTypeMeta {
  label: string;
  icon: "water-outline" | "nutrition-outline" | "cut-outline" | "refresh-outline";
  color: string;
}

export const CARE_TYPE_META: Record<CareTaskType, CareTypeMeta> = {
  watering: { label: "Regar", icon: "water-outline", color: "#3b82f6" },
  fertilizing: { label: "Abonar", icon: "nutrition-outline", color: "#10b981" },
  pruning: { label: "Podar", icon: "cut-outline", color: "#f59e0b" },
  rotation: { label: "Rotar", icon: "refresh-outline", color: "#8b5cf6" },
};

export const CARE_TYPES: CareTaskType[] = ["watering", "fertilizing", "pruning", "rotation"];
```

- [ ] **Step 10.3: Crear `dateRange.ts`**

```typescript
export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  // Trabajamos siempre en zona local; solo tomar YYYY-MM-DD
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function daysInMonthGrid(year: number, month: number): Array<{ date: string; inMonth: boolean }> {
  // Devuelve 42 celdas (6 semanas) empezando en Lunes
  const first = startOfMonth(year, month);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Lunes
  const start = new Date(year, month, 1 - firstWeekday);
  const cells: Array<{ date: string; inMonth: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: toISODate(d), inMonth: d.getMonth() === month });
  }
  return cells;
}

export function formatMonthLabel(year: number, month: number): string {
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${months[month]} ${year}`;
}

export function formatDayLabel(iso: string): string {
  const d = parseISODate(iso);
  const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}
```

- [ ] **Step 10.4: Verificar TypeScript compila**

Run: `cd mobile && npx tsc --noEmit`
Expected: sin errores nuevos relacionados con calendario/.

- [ ] **Step 10.5: Commit**

```bash
git add mobile/src/features/calendario/types.ts mobile/src/features/calendario/utils
git commit -m "feat(mobile): calendario types + careTypes + dateRange utils"
```

### Task 11: Store Zustand

**Files:**
- Modify: `mobile/src/features/calendario/store/calendario.feature.store.ts`

- [ ] **Step 11.1: Reemplazar archivo placeholder**

Sobreescribir `mobile/src/features/calendario/store/calendario.feature.store.ts`:
```typescript
import { create } from "zustand";

import type { CareRule, CareScheduleItem } from "../types";

interface CalendarioState {
  selectedDate: string;
  visibleMonth: { year: number; month: number };
  tasks: CareScheduleItem[];
  rulesByPlant: Record<string, CareRule[]>;
  isLoading: boolean;
  setSelectedDate: (d: string) => void;
  setVisibleMonth: (year: number, month: number) => void;
  setTasks: (tasks: CareScheduleItem[]) => void;
  upsertTask: (task: CareScheduleItem) => void;
  removeTask: (taskId: string) => void;
  setRulesForPlant: (plantId: string, rules: CareRule[]) => void;
  setIsLoading: (v: boolean) => void;
}

function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const useCalendarioStore = create<CalendarioState>((set) => ({
  selectedDate: todayISO(),
  visibleMonth: { year: new Date().getFullYear(), month: new Date().getMonth() },
  tasks: [],
  rulesByPlant: {},
  isLoading: false,
  setSelectedDate: (d) => set({ selectedDate: d }),
  setVisibleMonth: (year, month) => set({ visibleMonth: { year, month } }),
  setTasks: (tasks) => set({ tasks }),
  upsertTask: (task) =>
    set((state) => {
      const idx = state.tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const next = state.tasks.slice();
        next[idx] = task;
        return { tasks: next };
      }
      return { tasks: [...state.tasks, task] };
    }),
  removeTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),
  setRulesForPlant: (plantId, rules) =>
    set((state) => ({ rulesByPlant: { ...state.rulesByPlant, [plantId]: rules } })),
  setIsLoading: (v) => set({ isLoading: v }),
}));
```

- [ ] **Step 11.2: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 11.3: Commit**

```bash
git add mobile/src/features/calendario/store/calendario.feature.store.ts
git commit -m "feat(mobile): calendario zustand store"
```

### Task 12: API service

**Files:**
- Create: `mobile/src/features/calendario/services/calendarApi.service.ts`

- [ ] **Step 12.1: Crear servicio API**

```typescript
import { resolveApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from "@/src/services/api/httpClient";

import type {
  CareRule,
  CareRuleInput,
  CareScheduleItem,
  CompleteTaskResult,
} from "../types";

function base(): string {
  return resolveApiBaseUrl();
}

export async function fetchUserCareSchedule(
  userId: string,
  fromDate?: string,
  toDate?: string,
): Promise<CareScheduleItem[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const qs = params.toString();
  const url = `${base()}/api/users/${userId}/care-schedule${qs ? `?${qs}` : ""}`;
  return httpGet<CareScheduleItem[]>(url);
}

export async function fetchCareRules(userPlantId: string): Promise<CareRule[]> {
  return httpGet<CareRule[]>(`${base()}/api/user-plants/${userPlantId}/care-rules`);
}

export async function createCareRule(
  userPlantId: string,
  rule: CareRuleInput,
): Promise<CareRule> {
  return httpPost<CareRule, CareRuleInput>(
    `${base()}/api/user-plants/${userPlantId}/care-rules`,
    rule,
  );
}

export async function updateCareRule(
  ruleId: string,
  payload: Partial<Pick<CareRule, "intervalDays" | "notes" | "anchorDate" | "active">>,
): Promise<CareRule> {
  return httpPatch<CareRule, typeof payload>(
    `${base()}/api/care-rules/${ruleId}`,
    payload,
  );
}

export async function deleteCareRuleApi(ruleId: string): Promise<void> {
  await httpDelete(`${base()}/api/care-rules/${ruleId}`);
}

export async function createCareTask(payload: {
  userId: string;
  userPlantId: string;
  type: CareScheduleItem["type"];
  scheduledFor: string;
  notes?: string | null;
}): Promise<CareScheduleItem> {
  return httpPost<CareScheduleItem, typeof payload>(
    `${base()}/api/care-schedule`,
    payload,
  );
}

export async function updateCareTask(
  taskId: string,
  payload: Partial<Pick<CareScheduleItem, "scheduledFor" | "notes" | "status">>,
): Promise<CareScheduleItem> {
  return httpPatch<CareScheduleItem, typeof payload>(
    `${base()}/api/care-schedule/${taskId}`,
    payload,
  );
}

export async function deleteCareTaskApi(taskId: string): Promise<void> {
  await httpDelete(`${base()}/api/care-schedule/${taskId}`);
}

export async function completeCareTask(
  taskId: string,
  completedAt: string,
  notes?: string | null,
): Promise<CompleteTaskResult> {
  return httpPost<CompleteTaskResult, { completedAt: string; notes: string | null; value: null }>(
    `${base()}/api/care-schedule/${taskId}/complete`,
    { completedAt, notes: notes ?? null, value: null },
  );
}
```

- [ ] **Step 12.2: Verificar TS y `apiBaseUrl` export**

Si `resolveApiBaseUrl` no existe con ese nombre, revisar `mobile/src/services/api/apiBaseUrl.ts` y usar el nombre real. Run: `Grep -n "export" mobile/src/services/api/apiBaseUrl.ts`.

Run: `cd mobile && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 12.3: Commit**

```bash
git add mobile/src/features/calendario/services/calendarApi.service.ts
git commit -m "feat(mobile): calendario API service"
```

### Task 13: Offline cache + queue

**Files:**
- Create: `mobile/src/features/calendario/services/calendarOffline.service.ts`

- [ ] **Step 13.1: Crear servicio offline**

```typescript
import { cacheGet, cacheSet } from "@/src/services/offlineCache";

import type { CareRule, CareScheduleItem, QueuedAction } from "../types";

const TASKS_KEY = (userId: string) => `calendar.tasks.${userId}`;
const RULES_KEY = (plantId: string) => `calendar.rules.${plantId}`;
const QUEUE_KEY = (userId: string) => `calendar.queue.${userId}`;

export async function loadCachedTasks(userId: string): Promise<CareScheduleItem[]> {
  return (await cacheGet<CareScheduleItem[]>(TASKS_KEY(userId))) ?? [];
}

export async function saveCachedTasks(userId: string, tasks: CareScheduleItem[]): Promise<void> {
  await cacheSet(TASKS_KEY(userId), tasks);
}

export async function loadCachedRules(plantId: string): Promise<CareRule[]> {
  return (await cacheGet<CareRule[]>(RULES_KEY(plantId))) ?? [];
}

export async function saveCachedRules(plantId: string, rules: CareRule[]): Promise<void> {
  await cacheSet(RULES_KEY(plantId), rules);
}

export async function readQueue(userId: string): Promise<QueuedAction[]> {
  return (await cacheGet<QueuedAction[]>(QUEUE_KEY(userId))) ?? [];
}

export async function enqueueAction(userId: string, action: QueuedAction): Promise<void> {
  const queue = await readQueue(userId);
  queue.push(action);
  await cacheSet(QUEUE_KEY(userId), queue);
}

export async function clearQueue(userId: string): Promise<void> {
  await cacheSet<QueuedAction[]>(QUEUE_KEY(userId), []);
}

export async function popFront(userId: string): Promise<QueuedAction | null> {
  const queue = await readQueue(userId);
  if (queue.length === 0) return null;
  const next = queue.shift()!;
  await cacheSet(QUEUE_KEY(userId), queue);
  return next;
}
```

- [ ] **Step 13.2: Commit**

```bash
git add mobile/src/features/calendario/services/calendarOffline.service.ts
git commit -m "feat(mobile): calendario offline cache + queue helpers"
```

### Task 14: Local notifications

**Files:**
- Create: `mobile/src/features/calendario/services/localNotifications.service.ts`

- [ ] **Step 14.1: Crear servicio de notificaciones**

```typescript
import * as Notifications from "expo-notifications";

import { CARE_TYPE_META } from "../utils/careTypes";
import type { CareScheduleItem } from "../types";

let handlerSet = false;

function ensureHandler() {
  if (handlerSet) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerSet = true;
}

export async function ensurePermissions(): Promise<boolean> {
  ensureHandler();
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (!settings.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function buildTrigger(scheduledFor: string): Date | null {
  // 09:00 hora local del día scheduledFor
  const [y, m, d] = scheduledFor.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const trigger = new Date(y, m - 1, d, 9, 0, 0, 0);
  if (trigger.getTime() <= Date.now()) return null;
  return trigger;
}

export async function scheduleTaskNotification(
  task: CareScheduleItem,
  plantNickname: string,
): Promise<string | null> {
  ensureHandler();
  if (task.status !== "pending") return null;
  const trigger = buildTrigger(task.scheduledFor);
  if (!trigger) return null;
  const meta = CARE_TYPE_META[task.type];

  try {
    const id = await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: {
        title: `${meta.label} ${plantNickname}`,
        body: task.notes ?? `Recordatorio de cuidado`,
      },
      trigger: { date: trigger, channelId: "default" },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelTaskNotification(taskId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  } catch {}
}

export async function syncNotifications(
  tasks: CareScheduleItem[],
  plantNameLookup: (userPlantId: string) => string,
): Promise<void> {
  ensureHandler();
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
  for (const task of tasks) {
    if (task.status !== "pending") continue;
    await scheduleTaskNotification(task, plantNameLookup(task.userPlantId));
  }
}
```

- [ ] **Step 14.2: Verificar tipos**

Run: `cd mobile && npx tsc --noEmit`
Si la API de Notifications difiere por versión, ajustar `trigger` (algunas versiones esperan `{ type: 'date', date }` o número). Validar contra los typings reales del paquete instalado.

- [ ] **Step 14.3: Commit**

```bash
git add mobile/src/features/calendario/services/localNotifications.service.ts
git commit -m "feat(mobile): local notifications service"
```

---

## Phase 6: Mobile — UI

### Task 15: CalendarioScreen + MonthGrid

**Files:**
- Modify: `mobile/src/features/calendario/screens/CalendarioScreen/CalendarioScreen.tsx`
- Modify: `mobile/src/features/calendario/screens/CalendarioScreen/styles.ts`
- Create: `mobile/src/features/calendario/components/MonthGrid/MonthGrid.tsx`
- Create: `mobile/src/features/calendario/components/MonthGrid/styles.ts`
- Create: `mobile/src/features/calendario/components/MonthGrid/index.ts`
- Create: `mobile/src/features/calendario/hooks/useCalendarioScreen.ts`
- Create: `mobile/src/features/calendario/hooks/useMonthTasks.ts`

- [ ] **Step 15.1: Crear `useMonthTasks.ts`**

```typescript
import { useMemo } from "react";

import { daysInMonthGrid } from "../utils/dateRange";
import { useCalendarioStore } from "../store/calendario.feature.store";
import type { CareScheduleItem, CareTaskType } from "../types";

export interface DayCell {
  date: string;
  inMonth: boolean;
  types: CareTaskType[];
  hasTasks: boolean;
}

export function useMonthTasks(): DayCell[] {
  const visibleMonth = useCalendarioStore((s) => s.visibleMonth);
  const tasks = useCalendarioStore((s) => s.tasks);

  return useMemo(() => {
    const cells = daysInMonthGrid(visibleMonth.year, visibleMonth.month);
    const byDay = new Map<string, CareScheduleItem[]>();
    for (const t of tasks) {
      const day = t.scheduledFor.slice(0, 10);
      const arr = byDay.get(day) ?? [];
      arr.push(t);
      byDay.set(day, arr);
    }
    return cells.map((c) => {
      const items = byDay.get(c.date) ?? [];
      const types = Array.from(new Set(items.filter((i) => i.status === "pending").map((i) => i.type)));
      return { ...c, types, hasTasks: items.length > 0 };
    });
  }, [visibleMonth, tasks]);
}
```

- [ ] **Step 15.2: Crear `useCalendarioScreen.ts`**

```typescript
import { useEffect, useState } from "react";

import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

import { fetchUserCareSchedule } from "../services/calendarApi.service";
import {
  loadCachedTasks,
  saveCachedTasks,
} from "../services/calendarOffline.service";
import { ensurePermissions, syncNotifications } from "../services/localNotifications.service";
import { useCalendarioStore } from "../store/calendario.feature.store";
import { usePlantsStore } from "@/src/store/plants.store";

export function useCalendarioScreen() {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const tasks = useCalendarioStore((s) => s.tasks);
  const setTasks = useCalendarioStore((s) => s.setTasks);
  const setIsLoading = useCalendarioStore((s) => s.setIsLoading);
  const selectedDate = useCalendarioStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarioStore((s) => s.setSelectedDate);
  const visibleMonth = useCalendarioStore((s) => s.visibleMonth);
  const setVisibleMonth = useCalendarioStore((s) => s.setVisibleMonth);
  const plants = usePlantsStore((s) => s.plants);
  const [permissionAsked, setPermissionAsked] = useState(false);

  function getPlantNickname(userPlantId: string): string {
    const entry: any = plants.find((p: any) => {
      const payload = p?.userPlant ?? p;
      return payload?.id === userPlantId;
    });
    const payload = entry?.userPlant ?? entry;
    return payload?.nickname ?? "Planta";
  }

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const cached = await loadCachedTasks(userId);
      if (!cancelled && cached.length) setTasks(cached);
      setIsLoading(true);
      try {
        const fresh = await fetchUserCareSchedule(userId);
        if (cancelled) return;
        setTasks(fresh);
        await saveCachedTasks(userId, fresh);
        await syncNotifications(fresh, getPlantNickname);
      } catch {
        // silencio — cache ya está visible
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (permissionAsked) return;
    setPermissionAsked(true);
    ensurePermissions().catch(() => {});
  }, [permissionAsked]);

  return {
    isConnected,
    tasks,
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    getPlantNickname,
  };
}
```

- [ ] **Step 15.3: Crear `MonthGrid` component**

`mobile/src/features/calendario/components/MonthGrid/MonthGrid.tsx`:
```tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Pressable, View } from "react-native";

import { CARE_TYPE_META } from "../../utils/careTypes";
import { useMonthTasks } from "../../hooks/useMonthTasks";
import { createStyles } from "./styles";

interface MonthGridProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function MonthGrid({ selectedDate, onSelectDate }: MonthGridProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const cells = useMonthTasks();

  return (
    <View style={styles.wrap}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((d) => (
          <View key={d} style={styles.weekdayCell}>
            <AppText variant="caption" color={theme.colors.textSecondary}>{d}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const selected = cell.date === selectedDate;
          return (
            <Pressable
              key={cell.date}
              style={[
                styles.dayCell,
                selected ? styles.dayCellSelected : null,
              ]}
              onPress={() => onSelectDate(cell.date)}
            >
              <AppText
                variant="caption"
                color={
                  selected
                    ? theme.colors.textOnOverlay
                    : cell.inMonth
                    ? theme.colors.textPrimary
                    : theme.colors.textMuted
                }
              >
                {Number(cell.date.slice(8, 10))}
              </AppText>
              <View style={styles.dotsRow}>
                {cell.types.slice(0, 3).map((t) => (
                  <View
                    key={t}
                    style={[styles.dot, { backgroundColor: CARE_TYPE_META[t].color }]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
```

`mobile/src/features/calendario/components/MonthGrid/styles.ts`:
```typescript
import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/ThemeContext";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    weekdayRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.xs,
    },
    weekdayCell: {
      flex: 1,
      alignItems: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
    },
    dayCellSelected: {
      backgroundColor: theme.colors.primary,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 3,
      marginTop: 2,
      minHeight: 6,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
  });
}
```

`mobile/src/features/calendario/components/MonthGrid/index.ts`:
```typescript
export { default } from "./MonthGrid";
```

Nota: si `theme.radius`/`theme.spacing` no existen con esos nombres exactos, ajustar a los que el theme expone (revisar `mobile/src/theme/ThemeContext.tsx` para nombres reales).

- [ ] **Step 15.4: Reemplazar `CalendarioScreen`**

`mobile/src/features/calendario/screens/CalendarioScreen/CalendarioScreen.tsx`:
```tsx
import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";

import MonthGrid from "../../components/MonthGrid";
import { useCalendarioScreen } from "../../hooks/useCalendarioScreen";
import { formatMonthLabel } from "../../utils/dateRange";
import { createStyles } from "./styles";

export default function CalendarioScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const {
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
  } = useCalendarioScreen();

  function prevMonth() {
    const m = visibleMonth.month - 1;
    if (m < 0) setVisibleMonth(visibleMonth.year - 1, 11);
    else setVisibleMonth(visibleMonth.year, m);
  }

  function nextMonth() {
    const m = visibleMonth.month + 1;
    if (m > 11) setVisibleMonth(visibleMonth.year + 1, 0);
    else setVisibleMonth(visibleMonth.year, m);
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="subheading">
            {formatMonthLabel(visibleMonth.year, visibleMonth.month)}
          </AppText>
          <TouchableOpacity onPress={nextMonth} hitSlop={12}>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <MonthGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <View style={styles.agendaPlaceholder}>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Día seleccionado: {selectedDate}
          </AppText>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
```

`mobile/src/features/calendario/screens/CalendarioScreen/styles.ts`:
```typescript
import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/ThemeContext";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    scroll: {
      paddingBottom: theme.spacing.xxl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    agendaPlaceholder: {
      padding: theme.spacing.md,
    },
  });
}
```

- [ ] **Step 15.5: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`
Esperado: sin errores. Si `AppTheme` import path difiere, ajustar.

- [ ] **Step 15.6: Commit**

```bash
git add mobile/src/features/calendario
git commit -m "feat(mobile): CalendarioScreen + MonthGrid base"
```

### Task 16: DayAgenda + TaskCard

**Files:**
- Create: `mobile/src/features/calendario/components/DayAgenda/DayAgenda.tsx`
- Create: `mobile/src/features/calendario/components/DayAgenda/styles.ts`
- Create: `mobile/src/features/calendario/components/DayAgenda/index.ts`
- Create: `mobile/src/features/calendario/components/TaskCard/TaskCard.tsx`
- Create: `mobile/src/features/calendario/components/TaskCard/styles.ts`
- Create: `mobile/src/features/calendario/components/TaskCard/index.ts`
- Create: `mobile/src/features/calendario/hooks/useCompleteTask.ts`
- Modify: `mobile/src/features/calendario/screens/CalendarioScreen/CalendarioScreen.tsx`

- [ ] **Step 16.1: `useCompleteTask.ts`**

```typescript
import { useState } from "react";

import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

import { completeCareTask } from "../services/calendarApi.service";
import {
  enqueueAction,
  saveCachedTasks,
} from "../services/calendarOffline.service";
import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from "../services/localNotifications.service";
import { toISODate } from "../utils/dateRange";
import { useCalendarioStore } from "../store/calendario.feature.store";
import type { CareScheduleItem } from "../types";

export function useCompleteTask(getPlantNickname: (id: string) => string) {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const upsertTask = useCalendarioStore((s) => s.upsertTask);
  const tasks = useCalendarioStore((s) => s.tasks);
  const setTasks = useCalendarioStore((s) => s.setTasks);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function completeTask(task: CareScheduleItem) {
    if (!userId) return;
    setPendingId(task.id);
    const completedAt = toISODate(new Date());
    const optimistic: CareScheduleItem = { ...task, status: "completed" };
    upsertTask(optimistic);
    const nextTasks = tasks.map((t) => (t.id === task.id ? optimistic : t));
    await saveCachedTasks(userId, nextTasks);
    await cancelTaskNotification(task.id);

    if (isConnected === false) {
      await enqueueAction(userId, {
        kind: "complete",
        taskId: task.id,
        completedAt,
        notes: null,
      });
      setPendingId(null);
      return;
    }

    try {
      const result = await completeCareTask(task.id, completedAt, null);
      upsertTask(result.task);
      if (result.next) {
        upsertTask(result.next);
        await scheduleTaskNotification(result.next, getPlantNickname(result.next.userPlantId));
      }
      const refreshed = [
        ...nextTasks.filter((t) => t.id !== task.id && t.id !== result.next?.id),
        result.task,
        ...(result.next ? [result.next] : []),
      ];
      setTasks(refreshed);
      await saveCachedTasks(userId, refreshed);
    } catch {
      // Si red falla, encolamos
      await enqueueAction(userId, {
        kind: "complete",
        taskId: task.id,
        completedAt,
        notes: null,
      });
    } finally {
      setPendingId(null);
    }
  }

  return { completeTask, pendingId };
}
```

- [ ] **Step 16.2: `TaskCard` component**

`mobile/src/features/calendario/components/TaskCard/TaskCard.tsx`:
```tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { CARE_TYPE_META } from "../../utils/careTypes";
import type { CareScheduleItem } from "../../types";
import { createStyles } from "./styles";

interface TaskCardProps {
  task: CareScheduleItem;
  plantNickname: string;
  onComplete: (task: CareScheduleItem) => void;
  onSkip?: (task: CareScheduleItem) => void;
  disabled?: boolean;
}

export default function TaskCard({ task, plantNickname, onComplete, onSkip, disabled }: TaskCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const meta = CARE_TYPE_META[task.type];
  const isDone = task.status === "completed";

  return (
    <View style={[styles.card, isDone ? styles.cardDone : null]}>
      <View style={[styles.iconBubble, { backgroundColor: meta.color + "22" }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.body}>
        <AppText variant="label">{meta.label} · {plantNickname}</AppText>
        {task.notes ? (
          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
            {task.notes}
          </AppText>
        ) : null}
        <AppText variant="caption" color={isDone ? theme.colors.primary : theme.colors.textMuted}>
          {isDone ? "Completada" : task.status === "skipped" ? "Saltada" : "Pendiente"}
        </AppText>
      </View>
      {task.status === "pending" ? (
        <View style={styles.actions}>
          <Pressable
            onPress={() => onComplete(task)}
            disabled={disabled}
            style={[styles.actionBtn, { backgroundColor: meta.color }]}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
          </Pressable>
          {onSkip ? (
            <Pressable
              onPress={() => onSkip(task)}
              disabled={disabled}
              style={[styles.actionBtn, styles.actionBtnGhost]}
            >
              <Ionicons name="play-skip-forward-outline" size={18} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
```

`mobile/src/features/calendario/components/TaskCard/styles.ts`:
```typescript
import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/ThemeContext";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.xs,
    },
    cardDone: {
      opacity: 0.6,
    },
    iconBubble: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flex: 1,
      gap: 2,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    actionBtnGhost: {
      backgroundColor: theme.colors.surfaceDivider,
    },
  });
}
```

`mobile/src/features/calendario/components/TaskCard/index.ts`:
```typescript
export { default } from "./TaskCard";
```

- [ ] **Step 16.3: `DayAgenda` component**

`mobile/src/features/calendario/components/DayAgenda/DayAgenda.tsx`:
```tsx
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";

import TaskCard from "../TaskCard";
import { useCalendarioStore } from "../../store/calendario.feature.store";
import { formatDayLabel } from "../../utils/dateRange";
import { useCompleteTask } from "../../hooks/useCompleteTask";
import { createStyles } from "./styles";
import type { CareScheduleItem } from "../../types";

interface DayAgendaProps {
  selectedDate: string;
  getPlantNickname: (userPlantId: string) => string;
}

export default function DayAgenda({ selectedDate, getPlantNickname }: DayAgendaProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const tasks = useCalendarioStore((s) => s.tasks);
  const { completeTask, pendingId } = useCompleteTask(getPlantNickname);

  const dayTasks: CareScheduleItem[] = useMemo(
    () =>
      tasks
        .filter((t) => t.scheduledFor.slice(0, 10) === selectedDate)
        .sort((a, b) => a.type.localeCompare(b.type)),
    [tasks, selectedDate],
  );

  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.title}>
        {formatDayLabel(selectedDate)}
      </AppText>
      {dayTasks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={28} color={theme.colors.textSecondary} />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Sin tareas para este día.
          </AppText>
        </View>
      ) : (
        dayTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            plantNickname={getPlantNickname(t.userPlantId)}
            onComplete={completeTask}
            disabled={pendingId === t.id}
          />
        ))
      )}
    </View>
  );
}
```

`mobile/src/features/calendario/components/DayAgenda/styles.ts`:
```typescript
import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/ThemeContext";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    title: {
      marginBottom: theme.spacing.sm,
    },
    empty: {
      alignItems: "center",
      gap: theme.spacing.xs,
      padding: theme.spacing.lg,
    },
  });
}
```

`mobile/src/features/calendario/components/DayAgenda/index.ts`:
```typescript
export { default } from "./DayAgenda";
```

- [ ] **Step 16.4: Conectar `DayAgenda` en `CalendarioScreen`**

Sustituir el bloque `<View style={styles.agendaPlaceholder}>...</View>` por:
```tsx
<DayAgenda selectedDate={selectedDate} getPlantNickname={getPlantNickname} />
```

Y añadir el import:
```tsx
import DayAgenda from "../../components/DayAgenda";
```

Eliminar el estilo `agendaPlaceholder` de `styles.ts` (queda sin uso).

- [ ] **Step 16.5: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`

- [ ] **Step 16.6: Commit**

```bash
git add mobile/src/features/calendario
git commit -m "feat(mobile): DayAgenda + TaskCard + complete task flow"
```

### Task 17: AddTaskSheet (crear tarea manual)

**Files:**
- Create: `mobile/src/features/calendario/components/AddTaskSheet/AddTaskSheet.tsx`
- Create: `mobile/src/features/calendario/components/AddTaskSheet/styles.ts`
- Create: `mobile/src/features/calendario/components/AddTaskSheet/index.ts`
- Modify: `mobile/src/features/calendario/screens/CalendarioScreen/CalendarioScreen.tsx`

- [ ] **Step 17.1: `AddTaskSheet.tsx`**

```tsx
import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { usePlantsStore } from "@/src/store/plants.store";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import { createCareTask } from "../../services/calendarApi.service";
import { enqueueAction, saveCachedTasks } from "../../services/calendarOffline.service";
import { scheduleTaskNotification } from "../../services/localNotifications.service";
import { useCalendarioStore } from "../../store/calendario.feature.store";
import { CARE_TYPES, CARE_TYPE_META } from "../../utils/careTypes";
import { toISODate } from "../../utils/dateRange";
import type { CareTaskType } from "../../types";
import { createStyles } from "./styles";

interface AddTaskSheetProps {
  visible: boolean;
  defaultDate: string;
  onClose: () => void;
}

export default function AddTaskSheet({ visible, defaultDate, onClose }: AddTaskSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const plants = usePlantsStore((s) => s.plants);
  const tasks = useCalendarioStore((s) => s.tasks);
  const upsertTask = useCalendarioStore((s) => s.upsertTask);

  const [plantId, setPlantId] = useState<string>("");
  const [type, setType] = useState<CareTaskType>("watering");
  const [date, setDate] = useState<string>(defaultDate);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(defaultDate);
      setType("watering");
      setNotes("");
      setPlantId(plants[0] ? (plants[0] as any)?.userPlant?.id ?? (plants[0] as any)?.id ?? "" : "");
    }
  }, [visible, defaultDate]);

  async function handleSave() {
    if (!userId || !plantId) return;
    setSaving(true);
    try {
      const payload = {
        userId,
        userPlantId: plantId,
        type,
        scheduledFor: date,
        notes: notes.trim() || null,
      };
      if (isConnected === false) {
        const optimisticId = `local-${Date.now()}`;
        upsertTask({
          id: optimisticId,
          userId,
          userPlantId: plantId,
          type,
          status: "pending",
          scheduledFor: date,
          notes: payload.notes,
          ruleId: null,
        });
        await enqueueAction(userId, {
          kind: "create",
          payload: {
            userId,
            userPlantId: plantId,
            type,
            status: "pending",
            scheduledFor: date,
            notes: payload.notes,
            ruleId: null,
          },
        });
      } else {
        const created = await createCareTask(payload);
        upsertTask(created);
        const allTasks = [...tasks, created];
        await saveCachedTasks(userId, allTasks);
        const plant: any = plants.find((p: any) => (p?.userPlant?.id ?? p?.id) === plantId);
        const nickname = plant?.userPlant?.nickname ?? plant?.nickname ?? "Planta";
        await scheduleTaskNotification(created, nickname);
      }
      onClose();
    } catch {
      // noop, dejar el modal abierto
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={{ flex: 1 }} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <AppText variant="subheading">Nueva tarea</AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <AppText variant="label">Tipo</AppText>
          <View style={styles.typeRow}>
            {CARE_TYPES.map((t) => {
              const active = type === t;
              const meta = CARE_TYPE_META[t];
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[styles.typeChip, active ? { backgroundColor: meta.color } : null]}
                >
                  <Ionicons
                    name={meta.icon}
                    size={16}
                    color={active ? "#fff" : meta.color}
                  />
                  <AppText
                    variant="caption"
                    color={active ? "#fff" : theme.colors.textPrimary}
                  >
                    {meta.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="label" style={styles.label}>Planta</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plantsRow}>
            {plants.map((p: any) => {
              const id = p?.userPlant?.id ?? p?.id ?? "";
              const name = p?.userPlant?.nickname ?? p?.nickname ?? "Sin nombre";
              const active = plantId === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setPlantId(id)}
                  style={[styles.plantChip, active ? styles.plantChipActive : null]}
                >
                  <AppText
                    variant="caption"
                    color={active ? "#fff" : theme.colors.textPrimary}
                  >
                    {name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          <AppText variant="label" style={styles.label}>Fecha</AppText>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.textPrimary }]}
          />

          <AppText variant="label" style={styles.label}>Notas</AppText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Opcional"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.textPrimary }]}
            multiline
          />

          <AppButton
            title={saving ? "Guardando..." : "Crear tarea"}
            onPress={handleSave}
            disabled={saving || !plantId || !date}
          />
        </View>
      </View>
    </Modal>
  );
}
```

- [ ] **Step 17.2: `styles.ts` AddTaskSheet**

```typescript
import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/ThemeContext";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      gap: theme.spacing.sm,
    },
    handleBar: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.surfaceDivider,
      marginBottom: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    typeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.xs,
    },
    typeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
    },
    label: {
      marginTop: theme.spacing.sm,
    },
    plantsRow: {
      gap: theme.spacing.xs,
      paddingVertical: 2,
    },
    plantChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
    },
    plantChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
  });
}
```

`index.ts`:
```typescript
export { default } from "./AddTaskSheet";
```

- [ ] **Step 17.3: FAB en `CalendarioScreen`**

En `CalendarioScreen.tsx`:
- Importar `useState`, `AddTaskSheet`, `TouchableOpacity`.
- Añadir `const [showAdd, setShowAdd] = useState(false);` dentro del componente.
- Añadir un FAB absolutamente posicionado al final del retorno (fuera de `ScreenWrapper` o al final).
- Renderizar `<AddTaskSheet visible={showAdd} defaultDate={selectedDate} onClose={() => setShowAdd(false)} />` al final.

Estilo FAB en `styles.ts`:
```typescript
fab: {
  position: "absolute",
  right: theme.spacing.md,
  bottom: theme.spacing.xl,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: theme.colors.primary,
  alignItems: "center",
  justifyContent: "center",
  elevation: 4,
},
```

Componente FAB:
```tsx
<TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
  <Ionicons name="add" size={26} color="#fff" />
</TouchableOpacity>
```

- [ ] **Step 17.4: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`

- [ ] **Step 17.5: Commit**

```bash
git add mobile/src/features/calendario
git commit -m "feat(mobile): AddTaskSheet + calendario FAB"
```

### Task 18: EditRulesSheet (gestionar reglas de una planta)

**Files:**
- Create: `mobile/src/features/calendario/components/EditRulesSheet/EditRulesSheet.tsx`
- Create: `mobile/src/features/calendario/components/EditRulesSheet/styles.ts`
- Create: `mobile/src/features/calendario/components/EditRulesSheet/index.ts`

- [ ] **Step 18.1: `EditRulesSheet.tsx`**

```tsx
import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import {
  createCareRule,
  deleteCareRuleApi,
  fetchCareRules,
  updateCareRule,
} from "../../services/calendarApi.service";
import { useCalendarioStore } from "../../store/calendario.feature.store";
import { CARE_TYPES, CARE_TYPE_META } from "../../utils/careTypes";
import type { CareRule, CareRuleInput, CareTaskType } from "../../types";
import { createStyles } from "./styles";

interface EditRulesSheetProps {
  visible: boolean;
  userPlantId: string;
  onClose: () => void;
}

export default function EditRulesSheet({ visible, userPlantId, onClose }: EditRulesSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const rules = useCalendarioStore((s) => s.rulesByPlant[userPlantId] ?? []);
  const setRulesForPlant = useCalendarioStore((s) => s.setRulesForPlant);
  const [loading, setLoading] = useState(false);
  const [draftType, setDraftType] = useState<CareTaskType>("watering");
  const [draftInterval, setDraftInterval] = useState("7");
  const [draftNotes, setDraftNotes] = useState("");

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchCareRules(userPlantId)
      .then((r) => setRulesForPlant(userPlantId, r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, userPlantId]);

  async function addRule() {
    const interval = Number(draftInterval);
    if (!Number.isFinite(interval) || interval < 1) return;
    const input: CareRuleInput = {
      type: draftType,
      intervalDays: Math.min(365, Math.max(1, Math.trunc(interval))),
      notes: draftNotes.trim() || null,
    };
    try {
      const created = await createCareRule(userPlantId, input);
      setRulesForPlant(userPlantId, [...rules, created]);
      setDraftNotes("");
    } catch {}
  }

  async function toggleActive(rule: CareRule) {
    try {
      const updated = await updateCareRule(rule.id, { active: !rule.active });
      setRulesForPlant(
        userPlantId,
        rules.map((r) => (r.id === rule.id ? updated : r)),
      );
    } catch {}
  }

  async function removeRule(rule: CareRule) {
    try {
      await deleteCareRuleApi(rule.id);
      setRulesForPlant(userPlantId, rules.filter((r) => r.id !== rule.id));
    } catch {}
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={{ flex: 1 }} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <AppText variant="subheading">Cuidados programados</AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <ScrollView style={styles.rulesList} contentContainerStyle={{ gap: theme.spacing.xs }}>
              {rules.length === 0 ? (
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  Sin cuidados activos.
                </AppText>
              ) : (
                rules.map((r) => {
                  const meta = CARE_TYPE_META[r.type];
                  return (
                    <View key={r.id} style={styles.ruleRow}>
                      <View style={[styles.iconBubble, { backgroundColor: meta.color + "22" }]}>
                        <Ionicons name={meta.icon} size={16} color={meta.color} />
                      </View>
                      <View style={styles.ruleBody}>
                        <AppText variant="label">{meta.label} cada {r.intervalDays} días</AppText>
                        {r.notes ? (
                          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                            {r.notes}
                          </AppText>
                        ) : null}
                      </View>
                      <Pressable onPress={() => toggleActive(r)} style={styles.actionBtn}>
                        <Ionicons
                          name={r.active ? "pause-outline" : "play-outline"}
                          size={18}
                          color={theme.colors.textPrimary}
                        />
                      </Pressable>
                      <Pressable onPress={() => removeRule(r)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                      </Pressable>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          <AppText variant="label" style={styles.sectionLabel}>Añadir cuidado</AppText>
          <View style={styles.typeRow}>
            {CARE_TYPES.map((t) => {
              const active = draftType === t;
              const meta = CARE_TYPE_META[t];
              return (
                <Pressable
                  key={t}
                  onPress={() => setDraftType(t)}
                  style={[styles.typeChip, active ? { backgroundColor: meta.color } : null]}
                >
                  <Ionicons name={meta.icon} size={14} color={active ? "#fff" : meta.color} />
                  <AppText variant="caption" color={active ? "#fff" : theme.colors.textPrimary}>
                    {meta.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.row}>
            <TextInput
              value={draftInterval}
              onChangeText={setDraftInterval}
              keyboardType="number-pad"
              placeholder="Días"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.inputSmall, { color: theme.colors.textPrimary }]}
            />
            <TextInput
              value={draftNotes}
              onChangeText={setDraftNotes}
              placeholder="Notas (opcional)"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { color: theme.colors.textPrimary }]}
            />
          </View>
          <AppButton title="Añadir" onPress={addRule} />
        </View>
      </View>
    </Modal>
  );
}
```

- [ ] **Step 18.2: `styles.ts`**

```typescript
import { StyleSheet } from "react-native";
import type { AppTheme } from "@/src/theme/ThemeContext";

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      gap: theme.spacing.sm,
      maxHeight: "85%",
    },
    handleBar: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.surfaceDivider,
      marginBottom: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rulesList: {
      maxHeight: 240,
    },
    ruleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
    },
    iconBubble: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    ruleBody: {
      flex: 1,
    },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceDivider,
    },
    sectionLabel: {
      marginTop: theme.spacing.sm,
    },
    typeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.xs,
    },
    typeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
    },
    row: {
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    inputSmall: {
      width: 80,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.surfaceDivider,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
  });
}
```

`index.ts`:
```typescript
export { default } from "./EditRulesSheet";
```

- [ ] **Step 18.3: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`

- [ ] **Step 18.4: Commit**

```bash
git add mobile/src/features/calendario/components/EditRulesSheet
git commit -m "feat(mobile): EditRulesSheet to manage plant care rules"
```

---

## Phase 7: Offline queue drain

### Task 19: Drenar cola al reconectar

**Files:**
- Create: `mobile/src/features/calendario/hooks/useQueueDrainer.ts`
- Modify: `mobile/src/features/calendario/hooks/useCalendarioScreen.ts`

- [ ] **Step 19.1: `useQueueDrainer.ts`**

```typescript
import { useEffect, useRef } from "react";

import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

import {
  completeCareTask,
  createCareTask,
  deleteCareTaskApi,
  fetchUserCareSchedule,
  updateCareTask,
} from "../services/calendarApi.service";
import {
  clearQueue,
  popFront,
  readQueue,
  saveCachedTasks,
} from "../services/calendarOffline.service";
import { useCalendarioStore } from "../store/calendario.feature.store";

export function useQueueDrainer() {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const setTasks = useCalendarioStore((s) => s.setTasks);
  const draining = useRef(false);

  useEffect(() => {
    if (!userId || isConnected !== true || draining.current) return;
    (async () => {
      draining.current = true;
      try {
        let next = await popFront(userId);
        while (next) {
          try {
            if (next.kind === "create") {
              await createCareTask({
                userId: next.payload.userId,
                userPlantId: next.payload.userPlantId,
                type: next.payload.type,
                scheduledFor: next.payload.scheduledFor,
                notes: next.payload.notes,
              });
            } else if (next.kind === "update") {
              await updateCareTask(next.taskId, next.payload as any);
            } else if (next.kind === "delete") {
              await deleteCareTaskApi(next.taskId);
            } else if (next.kind === "complete") {
              await completeCareTask(next.taskId, next.completedAt, next.notes);
            }
          } catch {
            // descarte tras fallo (1 intento ya, drop)
          }
          next = await popFront(userId);
        }
        // Refrescar tasks tras drenar
        const fresh = await fetchUserCareSchedule(userId);
        setTasks(fresh);
        await saveCachedTasks(userId, fresh);
      } finally {
        draining.current = false;
      }
    })();
  }, [userId, isConnected]);
}
```

- [ ] **Step 19.2: Invocar `useQueueDrainer` desde `useCalendarioScreen`**

Al inicio del hook `useCalendarioScreen`, añadir:
```typescript
import { useQueueDrainer } from "./useQueueDrainer";

// dentro del hook, antes del primer `useEffect`:
useQueueDrainer();
```

- [ ] **Step 19.3: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`

- [ ] **Step 19.4: Commit**

```bash
git add mobile/src/features/calendario/hooks
git commit -m "feat(mobile): drain offline queue on reconnect"
```

---

## Phase 8: Integraciones

### Task 20: Integrar `careRules` en `SavePlantSheet`

**Files:**
- Modify: `mobile/src/features/identificar/services/aiIdentification.service.ts`
- Modify: `mobile/src/features/identificar/components/SavePlantSheet/SavePlantSheet.tsx`
- Modify: `mobile/src/features/identificar/components/SavePlantSheet/styles.ts`
- Modify: `mobile/src/features/identificar/hooks/...` (donde se llame a la API de crear planta — buscar con grep)

- [ ] **Step 20.1: Extender `PlantIdentificationResult` con `care_schedule`**

Run: `Grep -n "PlantIdentificationResult" mobile/src/features/identificar/services/aiIdentification.service.ts`

Localizar la interface/type `PlantIdentificationResult`. Añadir campo:
```typescript
care_schedule: Array<{ type: "watering" | "fertilizing" | "pruning" | "rotation"; intervalDays: number; notes: string | null; anchorDate: string | null }>;
```

Inicializar a `[]` si el campo no viene en la respuesta del backend. Ajustar la función de mapping si existe.

- [ ] **Step 20.2: Extender `SavePlantData` y UI con chips de care rules**

En `SavePlantSheet.tsx`, ampliar `SavePlantData`:
```typescript
export interface SavePlantData {
  nickname: string;
  locationHome?: string;
  publishToCatalog: boolean;
  careRules: Array<{ type: "watering"|"fertilizing"|"pruning"|"rotation"; intervalDays: number; notes: string | null }>;
}
```

Añadir estado:
```tsx
const [careRules, setCareRules] = useState(aiResult.care_schedule.map((r) => ({
  type: r.type, intervalDays: r.intervalDays, notes: r.notes,
})));
```

Reset en el `useEffect` de `visible`:
```typescript
setCareRules(aiResult.care_schedule.map((r) => ({
  type: r.type, intervalDays: r.intervalDays, notes: r.notes,
})));
```

Antes del bloque de publishToCatalog, renderizar:
```tsx
<View style={styles.fieldBlock}>
  <AppText variant="label">Cuidados sugeridos</AppText>
  {careRules.length === 0 ? (
    <AppText variant="caption" color={theme.colors.textSecondary}>
      La IA no propuso cuidados. Puedes añadirlos después.
    </AppText>
  ) : (
    <View style={styles.rulesWrap}>
      {careRules.map((r, idx) => (
        <View key={`${r.type}-${idx}`} style={styles.ruleChip}>
          <AppText variant="caption">
            {`${r.type === "watering" ? "Regar" : r.type === "fertilizing" ? "Abonar" : r.type === "pruning" ? "Podar" : "Rotar"} cada ${r.intervalDays} días`}
          </AppText>
          <Pressable
            onPress={() => setCareRules((arr) => arr.filter((_, i) => i !== idx))}
            hitSlop={6}
          >
            <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      ))}
    </View>
  )}
</View>
```

Estilo en `styles.ts`:
```typescript
rulesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
ruleChip: {
  flexDirection: "row", alignItems: "center", gap: 6,
  paddingHorizontal: 10, paddingVertical: 6,
  borderRadius: 999, borderWidth: 1, borderColor: theme.colors.surfaceDivider,
},
```

Modificar `handleSave` para enviar `careRules`:
```typescript
await onSave({
  nickname: nickname.trim(),
  locationHome: locationHome.trim() || undefined,
  publishToCatalog,
  careRules,
});
```

- [ ] **Step 20.3: Propagar `careRules` al request HTTP**

Localizar el handler que recibe `SavePlantData` y llama a la API. Run:
```
Grep -n "onSave" mobile/src/features/identificar
Grep -n "userPlants" mobile/src/features/identificar
```

En el servicio mobile que hace `POST /api/user-plants`, incluir `careRules` en el payload (si no existe, añadirlo). Ej.:
```typescript
const payload = {
  userId,
  plantCatalogId: ...,
  nickname: data.nickname,
  // ... resto
  careRules: data.careRules,
};
```

- [ ] **Step 20.4: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`

- [ ] **Step 20.5: Commit**

```bash
git add mobile/src/features/identificar
git commit -m "feat(mobile): SavePlantSheet collects + sends careRules"
```

### Task 21: Integrar `EditRulesSheet` en `PlantDetailScreen`

**Files:**
- Modify: `mobile/src/features/mis-plantas/screens/PlantDetailScreen/PlantDetailScreen.tsx`

- [ ] **Step 21.1: Importar y añadir botón**

En `PlantDetailScreen.tsx`:
```typescript
import EditRulesSheet from "@/src/features/calendario/components/EditRulesSheet";
// ...
const [showRules, setShowRules] = useState(false);
```

Dentro del JSX, después del bloque "Mi planta" (sectionCard de notas), añadir:
```tsx
<TouchableOpacity
  style={styles.rulesButton}
  onPress={() => setShowRules(true)}
  activeOpacity={0.8}
>
  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
  <AppText variant="label" color={colors.primary}>Cuidados programados</AppText>
</TouchableOpacity>
```

Y al final del componente (junto al `EditPlantModal` existente):
```tsx
<EditRulesSheet
  visible={showRules}
  userPlantId={getStringField(payload, "id")}
  onClose={() => setShowRules(false)}
/>
```

Añadir estilo `rulesButton` en `styles.ts`:
```typescript
rulesButton: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  alignSelf: "flex-start",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  marginTop: theme.spacing.sm,
},
```

- [ ] **Step 21.2: Verificar TS**

Run: `cd mobile && npx tsc --noEmit`

- [ ] **Step 21.3: Commit**

```bash
git add mobile/src/features/mis-plantas
git commit -m "feat(mobile): PlantDetailScreen opens EditRulesSheet"
```

---

## Phase 9: Verificación end-to-end

### Task 22: Pruebas manuales con dev-server

**Files:** (ninguna nueva, ejecutar y verificar)

- [ ] **Step 22.1: Levantar backend**

Run en terminal A: `cd backend-api && .venv\Scripts\python -m uvicorn app:app --reload --port 8000`
Expected: arranque sin errores, `Application startup complete`.

- [ ] **Step 22.2: Levantar mobile dev-client**

Run en terminal B: `cd mobile && npx expo start --dev-client`
Expected: Metro bundler arranca. Abrir en simulador/device con dev-client.

- [ ] **Step 22.3: Flujo: agregar planta con IA → tareas aparecen en calendario**

1. Tab Identificar → tomar foto → IA responde → SavePlantSheet aparece.
2. Verificar chips de "Cuidados sugeridos" se muestran.
3. Tap "Añadir al jardín".
4. Cambiar a tab Calendario.
5. Esperado: dots en días donde se materializaron tareas (riego cada 3 días, etc.).
6. Tap día con dot → ver tareas en agenda.

- [ ] **Step 22.4: Flujo: completar tarea**

1. En agenda, tap botón verde (✓) de una tarea.
2. Esperado: tarea pasa a "Completada", próxima tarea aparece en su día correspondiente (a +intervalDays).
3. Verificar dots en grid actualizados.

- [ ] **Step 22.5: Flujo: añadir tarea manual**

1. FAB + en CalendarioScreen.
2. Elegir tipo, planta, fecha, notas.
3. Crear.
4. Esperado: tarea aparece en agenda del día seleccionado.

- [ ] **Step 22.6: Flujo: gestionar reglas desde PlantDetail**

1. Mis plantas → tap una planta.
2. Tap "Cuidados programados".
3. Esperado: lista de reglas de la planta.
4. Añadir nueva regla (ej. rotación cada 14 días).
5. Volver a Calendario → verificar tareas nuevas materializadas.
6. Pausar regla (botón pausa) → verificar futuras tareas pending desaparecen.
7. Eliminar regla → confirmar.

- [ ] **Step 22.7: Flujo: offline**

1. Activar modo avión en el device.
2. Tab Calendario → cache aparece.
3. Crear tarea manual → se guarda optimista.
4. Desactivar modo avión.
5. Esperado: tarea se sincroniza tras reconexión (cola drenada).

- [ ] **Step 22.8: Flujo: notificaciones**

1. Permitir notificaciones en primer arranque.
2. Crear tarea manual con `scheduledFor` = mañana.
3. Verificar en Settings del SO que la notificación está programada (o esperar al día siguiente 09:00).

- [ ] **Step 22.9: Documentar resultados**

Si algún paso falla, documentar en commit message lo que se ajustó.

- [ ] **Step 22.10: Commit final si hay ajustes**

```bash
git add -A
git commit -m "fix(calendario): adjustments after manual verification"
```

### Task 23: Correr toda la suite y resumen

- [ ] **Step 23.1: Backend tests**

Run: `cd backend-api && .venv\Scripts\python -m pytest -v`
Expected: todos los tests PASSED (modelos + services_care + services_ai).

- [ ] **Step 23.2: Mobile typecheck**

Run: `cd mobile && npx tsc --noEmit`
Expected: 0 errores.

- [ ] **Step 23.3: Mobile lint**

Run: `cd mobile && npx expo lint`
Expected: sin errores nuevos en `mobile/src/features/calendario/` ni en archivos modificados.

- [ ] **Step 23.4: Commit cleanup si hubo cambios**

```bash
git add -A
git commit -m "chore(calendario): lint + typecheck cleanups"
```

---

## Self-review notes

Spec coverage:
- Modelos (Task 2), services_care (Tasks 3-6), endpoints (Task 7), POST user-plants extendido (Task 8), IA prompt (Task 9), tipos mobile (Task 10), store (Task 11), API service (Task 12), offline (Task 13), notifications (Task 14), CalendarioScreen+MonthGrid (Task 15), DayAgenda+TaskCard (Task 16), AddTaskSheet (Task 17), EditRulesSheet (Task 18), queue drain (Task 19), SavePlantSheet integration (Task 20), PlantDetailScreen integration (Task 21), manual verification (Task 22), full suite (Task 23). Spec section "Testing" — backend cubierto en Tasks 2-9. Mobile unit tests omitidos por ausencia de jest en el proyecto; reemplazados por typecheck + verificación manual. Documentado en spec.

Type consistency:
- `CareScheduleItem.ruleId: string | null` consistente entre backend (`Task 2`) y mobile (`Task 10`).
- `intervalDays` siempre `int` ≥ 1 con clamp 365.
- Doc-id determinista `{ruleId}_{scheduledFor}` usado consistente en Tasks 3 y 4.
- `completedAt` ISO date (YYYY-MM-DD) usado en Task 4 y Task 16 (`toISODate(new Date())`).

Risks no cubiertos:
- Cascade delete al borrar `userPlant` (out-of-scope explícito en spec).
- Tests E2E con device real para notificaciones — limitado a verificación manual.
