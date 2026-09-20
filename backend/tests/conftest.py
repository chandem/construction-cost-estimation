import pytest
from fastapi.testclient import TestClient

import app.db as db_module
import app.api.boq as boq_module
import app.api.categories as categories_module
import app.api.estimate_versions as estimate_versions_module
import app.api.exports as exports_module
import app.api.pdf_export as pdf_export_module
import app.api.projects as projects_module
import app.api.rate_analysis as rate_analysis_module
import app.api.rates as rates_module
import app.api.summary as summary_module
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
        self.order_desc = False

    def select(self, *_args):
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

    def order(self, field, desc=False):
        self.order_field = field
        self.order_desc = desc
        return self

    def limit(self, *_args):
        return self

    def in_(self, field, values):
        self.filters.append((field, set(str(v) for v in values)))
        return self

    def execute(self):
        rows = self.store.setdefault(self.table_name, [])

        def matches(row):
            for key, value in self.filters:
                if isinstance(value, set):
                    if str(row.get(key)) not in value:
                        return False
                elif str(row.get(key)) != str(value):
                    return False
            return True

        if self.operation == "insert":
            payloads = self.payload if isinstance(self.payload, list) else [self.payload]
            inserted = []
            for payload in payloads:
                row = dict(payload)
                row.setdefault("id", f"{self.table_name}-{len(rows) + 1}")
                row.setdefault("created_at", "2026-01-01T00:00:00Z")
                row.setdefault("updated_at", "2026-01-01T00:00:00Z")
                if self.table_name == "boq_items":
                    from decimal import Decimal
                    row["amount"] = (Decimal(str(row["quantity"])) * Decimal(str(row["unit_rate"]))).quantize(Decimal("0.01"))
                if self.table_name == "rate_analysis_components":
                    from decimal import Decimal
                    row["amount"] = (Decimal(str(row["quantity"])) * (Decimal("1") + Decimal(str(row["waste_percent"])) / Decimal("100")) * Decimal(str(row["unit_rate_snapshot"]))).quantize(Decimal("0.01"))
                if self.table_name == "estimate_version_items":
                    from decimal import Decimal
                    row["amount"] = (Decimal(str(row["quantity"])) * Decimal(str(row["unit_rate"]))).quantize(Decimal("0.01"))
                rows.append(row)
                inserted.append(row)
            return FakeResponse(inserted)

        matched = [row for row in rows if matches(row)]

        if self.operation == "update":
            for row in matched:
                row.update(self.payload)
                if self.table_name == "boq_items":
                    from decimal import Decimal
                    row["amount"] = (Decimal(str(row["quantity"])) * Decimal(str(row["unit_rate"]))).quantize(Decimal("0.01"))
            return FakeResponse(matched)

        if self.operation == "delete":
            self.store[self.table_name] = [row for row in rows if not matches(row)]
            return FakeResponse(matched)

        if self.order_field:
            matched.sort(key=lambda row: row.get(self.order_field) or "", reverse=self.order_desc)
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
    modules = [
        db_module,
        projects_module,
        boq_module,
        categories_module,
        rates_module,
        rate_analysis_module,
        summary_module,
        estimate_versions_module,
        exports_module,
        pdf_export_module,
    ]
    originals = [(module, module.get_supabase) for module in modules]
    for module, _ in originals:
        module.get_supabase = lambda client=client: client
    yield client
    for module, original in originals:
        module.get_supabase = original


@pytest.fixture
def client(fake_supabase):
    return TestClient(app)
