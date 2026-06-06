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
    """Provide a FakeFirestore instance with monkeypatched get_firestore_client.

    This fixture patches get_firestore_client in app.firebase, app.services, and
    app.routes modules to return the fake_db instance instead of the real Firestore client.

    Usage:
        def test_example(fake_db):
            from app.services import get_document
            # Test code - get_document will use fake_db
    """
    db = FakeFirestore()

    # Patch firebase module
    from app import firebase as firebase_mod
    monkeypatch.setattr(firebase_mod, "get_firestore_client", lambda: db)

    # Patch services module
    from app import services as services_mod
    monkeypatch.setattr(services_mod, "get_firestore_client", lambda: db)

    # Patch routes module if available
    try:
        from app import routes as routes_mod
        monkeypatch.setattr(routes_mod, "get_firestore_client", lambda: db)
    except Exception:
        pass

    # Patch services_care module if available
    try:
        from app import services_care as services_care_mod
        monkeypatch.setattr(services_care_mod, "get_firestore_client", lambda: db)
    except Exception:
        pass

    return db
