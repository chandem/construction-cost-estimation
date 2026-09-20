from decimal import Decimal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_supabase
from app.services.calculation import calculate_breakdown

router = APIRouter(prefix="/projects/{project_id}/summary", tags=["summary"])


class EstimateSummaryRequest(BaseModel):
    overhead_percent: Decimal = Field(default=0, ge=0)
    profit_percent: Decimal = Field(default=0, ge=0)
    contingency_percent: Decimal = Field(default=0, ge=0)


class EstimateSummaryResponse(BaseModel):
    project_id: str
    item_count: int
    direct_cost: Decimal
    overhead: Decimal
    profit: Decimal
    contingency: Decimal
    grand_total: Decimal


@router.post("", response_model=EstimateSummaryResponse)
def calculate_project_summary(
    project_id: str, settings: EstimateSummaryRequest
) -> EstimateSummaryResponse:
    client = get_supabase()

    project = (
        client.table("projects")
        .select("id")
        .eq("id", project_id)
        .limit(1)
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    items = (
        client.table("boq_items")
        .select("quantity,unit_rate")
        .eq("project_id", project_id)
        .execute()
    )

    direct_cost = sum(
        (Decimal(str(row["quantity"])) * Decimal(str(row["unit_rate"])) for row in items.data),
        Decimal("0"),
    ).quantize(Decimal("0.01"))

    breakdown = calculate_breakdown(
        direct_cost,
        settings.overhead_percent,
        settings.profit_percent,
        settings.contingency_percent,
    )

    return EstimateSummaryResponse(
        project_id=project_id,
        item_count=len(items.data),
        direct_cost=breakdown["subtotal"],
        overhead=breakdown["overhead"],
        profit=breakdown["profit"],
        contingency=breakdown["contingency"],
        grand_total=breakdown["total"],
    )
