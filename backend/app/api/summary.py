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


class SectionSummary(BaseModel):
    section_id: str | None
    section_name: str
    item_count: int
    subtotal: Decimal


class ProjectSummaryResponse(EstimateSummaryResponse):
    sections: list[SectionSummary]


@router.post("", response_model=ProjectSummaryResponse)
def calculate_project_summary(
    project_id: str, settings: EstimateSummaryRequest
) -> ProjectSummaryResponse:
    client = get_supabase()

    project = client.table("projects").select("id").eq("id", project_id).limit(1).execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    items = (
        client.table("boq_items")
        .select("quantity,unit_rate,section_id")
        .eq("project_id", project_id)
        .execute()
    )

    sections_result = (
        client.table("boq_sections")
        .select("id,name,sort_order")
        .eq("project_id", project_id)
        .order("sort_order")
        .execute()
    )
    section_names = {str(row["id"]): row["name"] for row in sections_result.data}

    section_totals: dict[str | None, tuple[int, Decimal]] = {}
    for row in items.data:
        section_id = str(row["section_id"]) if row.get("section_id") else None
        amount = Decimal(str(row["quantity"])) * Decimal(str(row["unit_rate"]))
        count, subtotal = section_totals.get(section_id, (0, Decimal("0")))
        section_totals[section_id] = (count + 1, subtotal + amount)

    direct_cost = sum((subtotal for _, subtotal in section_totals.values()), Decimal("0")).quantize(
        Decimal("0.01")
    )
    breakdown = calculate_breakdown(
        direct_cost,
        settings.overhead_percent,
        settings.profit_percent,
        settings.contingency_percent,
    )

    sections = []
    for row in sections_result.data:
        key = str(row["id"])
        count, subtotal = section_totals.get(key, (0, Decimal("0")))
        sections.append(
            SectionSummary(
                section_id=key,
                section_name=row["name"],
                item_count=count,
                subtotal=subtotal.quantize(Decimal("0.01")),
            )
        )

    unassigned_count, unassigned_total = section_totals.get(None, (0, Decimal("0")))
    if unassigned_count:
        sections.append(
            SectionSummary(
                section_id=None,
                section_name="Unassigned",
                item_count=unassigned_count,
                subtotal=unassigned_total.quantize(Decimal("0.01")),
            )
        )

    return ProjectSummaryResponse(
        project_id=project_id,
        item_count=len(items.data),
        direct_cost=breakdown["subtotal"],
        overhead=breakdown["overhead"],
        profit=breakdown["profit"],
        contingency=breakdown["contingency"],
        grand_total=breakdown["total"],
        sections=sections,
    )
