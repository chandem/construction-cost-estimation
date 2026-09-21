from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import get_supabase

router = APIRouter(prefix="/seed", tags=["seed"])

DEFAULT_CATEGORIES = [
    {"name": "Material", "description": "Construction materials (cement, steel, aggregates, finishes)"},
    {"name": "Labor", "description": "Skilled and unskilled labor rates"},
    {"name": "Equipment", "description": "Plant, machinery and tool hire"},
    {"name": "Subcontract", "description": "Specialist subcontract packages"},
]

# Illustrative Addis Ababa unit rates (ETB) — adjust to current market before tender use
SAMPLE_RATES = [
    {"category": "Material", "code": "CEM-OPC", "name": "Ordinary Portland Cement", "unit": "quintal", "rate": 1850},
    {"category": "Material", "code": "AGG-C", "name": "Crushed aggregate (20mm)", "unit": "m3", "rate": 2200},
    {"category": "Material", "code": "SND-R", "name": "River sand", "unit": "m3", "rate": 1800},
    {"category": "Material", "code": "STL-Y12", "name": "Reinforcement steel Y12", "unit": "ton", "rate": 125000},
    {"category": "Material", "code": "BLK-HC", "name": "Hollow concrete block 20cm", "unit": "pcs", "rate": 45},
    {"category": "Labor", "code": "LBR-MS", "name": "Mason (skilled)", "unit": "day", "rate": 800},
    {"category": "Labor", "code": "LBR-US", "name": "Unskilled laborer", "unit": "day", "rate": 450},
    {"category": "Labor", "code": "LBR-STL", "name": "Steel fixer", "unit": "day", "rate": 900},
    {"category": "Equipment", "code": "EQ-MIX", "name": "Concrete mixer 350L", "unit": "day", "rate": 2500},
    {"category": "Equipment", "code": "EQ-VIB", "name": "Poker vibrator", "unit": "day", "rate": 800},
]


class SeedResponse(BaseModel):
    categories_created: int
    rates_created: int
    message: str


@router.post("/ethiopia-defaults", response_model=SeedResponse)
def seed_ethiopia_defaults() -> SeedResponse:
    """Idempotent-ish seed of categories and sample Addis Ababa rates."""
    client = get_supabase()

    existing_cats = client.table("cost_categories").select("id,name").execute()
    by_name = {row["name"]: str(row["id"]) for row in existing_cats.data or []}

    categories_created = 0
    for cat in DEFAULT_CATEGORIES:
        if cat["name"] in by_name:
            continue
        result = client.table("cost_categories").insert(cat).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail=f"Could not create category {cat['name']}")
        by_name[cat["name"]] = str(result.data[0]["id"])
        categories_created += 1

    existing_rates = client.table("cost_rates").select("code").execute()
    existing_codes = {row["code"] for row in existing_rates.data or []}

    rates_created = 0
    for rate in SAMPLE_RATES:
        if rate["code"] in existing_codes:
            continue
        category_id = by_name.get(rate["category"])
        if not category_id:
            continue
        payload = {
            "category_id": category_id,
            "code": rate["code"],
            "name": rate["name"],
            "unit": rate["unit"],
            "rate": rate["rate"],
            "currency": "ETB",
            "region": "Addis Ababa",
            "source": "Seed sample — verify before use",
            "notes": "Illustrative rate for development; update to current market prices",
        }
        result = client.table("cost_rates").insert(payload).execute()
        if result.data:
            rates_created += 1

    return SeedResponse(
        categories_created=categories_created,
        rates_created=rates_created,
        message="Seed complete. Sample rates are illustrative — update before tender use.",
    )
