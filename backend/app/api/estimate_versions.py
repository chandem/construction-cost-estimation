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


def _build_version(client, project_id: str, version_id: str, data: EstimateVersionCreate, version_no: int):
    items = client.table("boq_items").select("quantity,unit_rate").eq("project_id", project_id).execute()
    direct = sum(
        (Decimal(str(x["quantity"])) * Decimal(str(x["unit_rate"])) for x in items.data),
        Decimal("0"),
    ).quantize(Decimal("0.01"))
    breakdown = calculate_breakdown(
        direct, data.overhead_percent, data.profit_percent, data.contingency_percent
    )
    return EstimateVersionResponse(
        id=version_id,
        project_id=project_id,
        version_no=version_no,
        name=data.name,
        overhead_percent=data.overhead_percent,
        profit_percent=data.profit_percent,
        contingency_percent=data.contingency_percent,
        direct_cost=breakdown["subtotal"],
        overhead=breakdown["overhead"],
        profit=breakdown["profit"],
        contingency=breakdown["contingency"],
        grand_total=breakdown["total"],
        notes=data.notes,
    )


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
    return _build_version(client, project_id, str(row["id"]), data, version_no)


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
    return [
        _build_version(
            client,
            project_id,
            str(row["id"]),
            EstimateVersionCreate(
                name=row["name"],
                overhead_percent=row["overhead_percent"],
                profit_percent=row["profit_percent"],
                contingency_percent=row["contingency_percent"],
                notes=row.get("notes"),
            ),
            row["version_no"],
        )
        for row in rows.data
    ]
