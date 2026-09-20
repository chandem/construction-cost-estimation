from decimal import Decimal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_supabase
from app.services.calculation import calculate_breakdown

router = APIRouter(prefix="/projects/{project_id}/estimate-versions", tags=["estimate-versions"])


class EstimateVersionCreate(BaseModel):
    name: str = Field(min_length=1)
    overhead_percent: Decimal = Field(default=0, ge=0)
    profit_percent: Decimal = Field(default=0, ge=0)
    contingency_percent: Decimal = Field(default=0, ge=0)
    notes: str | None = None


class EstimateVersionItemResponse(BaseModel):
    id: str
    item_no: int
    description: str
    unit: str
    quantity: Decimal
    unit_rate: Decimal
    amount: Decimal
    section_name: str | None = None


class EstimateVersionResponse(BaseModel):
    id: str
    project_id: str
    version_no: int
    name: str
    overhead_percent: Decimal
    profit_percent: Decimal
    contingency_percent: Decimal
    direct_cost: Decimal
    overhead: Decimal
    profit: Decimal
    contingency: Decimal
    grand_total: Decimal
    notes: str | None = None
    items: list[EstimateVersionItemResponse] = Field(default_factory=list)


def _breakdown(direct: Decimal, data: EstimateVersionCreate) -> dict[str, Decimal]:
    return calculate_breakdown(
        direct,
        data.overhead_percent,
        data.profit_percent,
        data.contingency_percent,
    )


def _response(row: dict, items: list[dict]) -> EstimateVersionResponse:
    item_responses = [
        EstimateVersionItemResponse(
            id=str(item["id"]),
            item_no=item["item_no"],
            description=item["description"],
            unit=item["unit"],
            quantity=item["quantity"],
            unit_rate=item["unit_rate"],
            amount=item["amount"],
            section_name=item.get("section_name"),
        )
        for item in items
    ]
    direct = sum((Decimal(str(item["amount"])) for item in items), Decimal("0")).quantize(
        Decimal("0.01")
    )
    data = EstimateVersionCreate(
        name=row["name"],
        overhead_percent=row["overhead_percent"],
        profit_percent=row["profit_percent"],
        contingency_percent=row["contingency_percent"],
        notes=row.get("notes"),
    )
    breakdown = _breakdown(direct, data)
    return EstimateVersionResponse(
        id=str(row["id"]),
        project_id=str(row["project_id"]),
        version_no=row["version_no"],
        name=row["name"],
        overhead_percent=data.overhead_percent,
        profit_percent=data.profit_percent,
        contingency_percent=data.contingency_percent,
        direct_cost=breakdown["subtotal"],
        overhead=breakdown["overhead"],
        profit=breakdown["profit"],
        contingency=breakdown["contingency"],
        grand_total=breakdown["total"],
        notes=data.notes,
        items=item_responses,
    )


def _get_items(client, version_id: str) -> list[dict]:
    return (
        client.table("estimate_version_items")
        .select("*")
        .eq("estimate_version_id", version_id)
        .order("item_no")
        .execute()
    ).data


@router.post("", response_model=EstimateVersionResponse, status_code=201)
def create_estimate_version(project_id: str, data: EstimateVersionCreate):
    client = get_supabase()
    project = client.table("projects").select("id").eq("id", project_id).limit(1).execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    latest = (
        client.table("estimate_versions")
        .select("version_no")
        .eq("project_id", project_id)
        .order("version_no", desc=True)
        .limit(1)
        .execute()
    )
    version_no = (latest.data[0]["version_no"] + 1) if latest.data else 1

    result = client.table("estimate_versions").insert({
        "project_id": project_id,
        "version_no": version_no,
        **data.model_dump(),
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Estimate version could not be created")

    row = result.data[0]
    boq = (
        client.table("boq_items")
        .select("item_no,description,unit,quantity,unit_rate,section_id")
        .eq("project_id", project_id)
        .order("item_no")
        .execute()
    ).data

    section_ids = [str(x["section_id"]) for x in boq if x.get("section_id")]
    section_names: dict[str, str] = {}
    if section_ids:
        sections = client.table("boq_sections").select("id,name").in_("id", section_ids).execute()
        section_names = {str(x["id"]): x["name"] for x in sections.data}

    snapshot_rows = [
        {
            "estimate_version_id": row["id"],
            "item_no": item["item_no"],
            "description": item["description"],
            "unit": item["unit"],
            "quantity": item["quantity"],
            "unit_rate": item["unit_rate"],
            "section_name": section_names.get(str(item["section_id"])) if item.get("section_id") else None,
        }
        for item in boq
    ]
    if snapshot_rows:
        client.table("estimate_version_items").insert(snapshot_rows).execute()

    return _response(row, _get_items(client, str(row["id"])))


@router.get("", response_model=list[EstimateVersionResponse])
def list_estimate_versions(project_id: str):
    client = get_supabase()
    rows = (
        client.table("estimate_versions")
        .select("*")
        .eq("project_id", project_id)
        .order("version_no", desc=True)
        .execute()
    )
    return [_response(row, _get_items(client, str(row["id"]))) for row in rows.data]


@router.get("/{version_id}", response_model=EstimateVersionResponse)
def get_estimate_version(project_id: str, version_id: str):
    client = get_supabase()
    result = client.table("estimate_versions").select("*").eq(
        "id", version_id
    ).eq("project_id", project_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Estimate version not found")
    return _response(result.data[0], _get_items(client, version_id))
