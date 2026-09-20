import pytest
from fastapi.testclient import TestClient

from app.main import app


class FakeResponse:
    def __init__(self, data=None):
        self.data = data or []


class FakeQuery:
    def __init__(self, store, table):
        self.store = store
        self.table_name = table
        self.filters = []
        self.operation = "select"
        self.payload = None
        self.order_field = None

    def select(self, *_args):
        self.operation = "select"
        return self

    def insert(self, payload):
        self.operation = "insert"
        self.payload = payload
        return self

    def update(self, payload):
        self.operation = "update"
        self.payload = payload
        return self

    def delete(self):
        self.operation = "delete"
        return self

    def eq(self, field, value):
        self.filters.append((field, value))
        return self

    def order(self, field):
        self.order_field = field
        return self

    def limit(self, *_args):
        return self

    def execute(self):
        rows = self.store.setdefault(self.table_name, [])

        def matches(row):
            return all(str(row.get(k)) == str(v) for k, v in self.filters)

        if self.operation == "insert":
            payloads = self.payload if isinstance(self.payload, list) else [self.payload]
            inserted = []
            for payload in payloads:
                row = dict(payload)
                row.setdefault("id", f"{self.table_name}-{len(rows) + 1}")
                row.setdefault("created_at", "2026-01-01T00:00:00Z")
                rows.append(row)
                inserted.append(row)
            return FakeResponse(inserted)

        matched = [row for row in rows if matches(row)]

        if self.operation == "update":
            for row in matched:
                row.update(self.payload)
                if self.table_name == "boq_items":
                    row["amount"] = str(float(row["quantity"]) * float(row["unit_rate"]))
            return FakeResponse(matched)

        if self.operation == "delete":
            self.store[self.table_name] = [row for row in rows if not matches(row)]
            return FakeResponse(matched)

        if self.order_field:
            matched.sort(key=lambda row: row.get(self.order_field) or "")
        return FakeResponse(matched)


class FakeSupabase:
    def __init__(self):
        self.store = {
            "projects": [],
            "boq_items": [],
            "boq_sections": [],
            "cost_categories": [],
            "cost_rates": [],
            "rate_analyses": [],
            "rate_analysis_components": [],
            "estimate_versions": [],
            "estimate_version_items": [],
        }

    def table(self, name):
        return FakeQuery(self.store, name)


@pytest.fixture
def fake_supabase():
    client = FakeSupabase()
    import app.db
    original = app.db.get_supabase
    app.db.get_supabase = lambda: client
    yield client
    app.db.get_supabase = original


@pytest.fixture
def client(fake_supabase):
    return TestClient(app)
