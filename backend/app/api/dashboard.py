from decimal import Decimal

from fastapi import APIRouter

from app.db import get_supabase

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats() -> dict:
    """Aggregate counts and totals for the overview dashboard."""
    client = get_supabase()

    projects = client.table("projects").select("id", count="exact").execute()
    categories = client.table("cost_categories").select("id", count="exact").execute()
    rates = client.table("cost_rates").select("id", count="exact").execute()
    analyses = client.table("rate_analyses").select("id", count="exact").execute()
    boq_items = client.table("boq_items").select("id,quantity,unit_rate", count="exact").execute()
    versions = client.table("estimate_versions").select("id", count="exact").execute()

    direct = Decimal("0")
    for row in boq_items.data or []:
        direct += Decimal(str(row.get("quantity") or 0)) * Decimal(str(row.get("unit_rate") or 0))

    def _count(result) -> int:
        if getattr(result, "count", None) is not None:
            return int(result.count)
        return len(result.data or [])

    return {
        "projects": _count(projects),
        "categories": _count(categories),
        "cost_rates": _count(rates),
        "rate_analyses": _count(analyses),
        "boq_items": _count(boq_items),
        "estimate_versions": _count(versions),
        "total_direct_cost": float(direct.quantize(Decimal("0.01"))),
    }
