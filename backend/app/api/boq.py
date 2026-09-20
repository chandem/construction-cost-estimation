from decimal import Decimal

from fastapi import APIRouter, HTTPException

from app.db import get_supabase
from app.schemas.boq import (
    BOQItemCreate,
    BOQItemResponse,
    BOQSectionCreate,
    BOQSectionResponse,
)

router = APIRouter(prefix="/projects/{project_id}/boq", tags=["boq"])


def _item_response(row: dict) -> BOQItemResponse:
    return BOQItemResponse(
        id=str(row["id"]),
        item_no=row["item_no"],
        description=row["description"],
        unit=row["unit"],
        quantity=row["quantity"],
        unit_rate=row["unit_rate"],
        rate_analysis_id=str(row["rate_analysis_id"]) if row.get("rate_analysis_id") else None,
        section_id=str(row["section_id"]) if row.get("section_id") else None,
        amount=row["amount"],
    )


def _section_response(row: dict) -> BOQSectionResponse:
    return BOQSectionResponse(
        id=str(row["id"]),
        project_id=str(row["project_id"]),
        name=row["name"],
        code=row.get("code"),
        description=row.get("description"),
        sort_order=row["sort_order"],
    )


def _resolve_unit_rate(client, item: BOQItemCreate) -> Decimal:
    if not item.rate_analysis_id:
        return item.unit_rate
    result = client.table("rate_analyses").select("id").eq("id", item.rate_analysis_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Rate analysis not found")
    components = client.table("rate_analysis_components").select("amount").eq(
        "rate_analysis_id", item.rate_analysis_id
    ).execute()
    if not components.data:
        raise HTTPException(status_code=400, detail="Rate analysis has no components")
    return sum((Decimal(str(row["amount"])) for row in components.data), Decimal("0")).quantize(Decimal("0.01"))


@router.post("/sections", response_model=BOQSectionResponse, status_code=201)
def create_section(project_id: str, section: BOQSectionCreate) -> BOQSectionResponse:
    client = get_supabase()
    result = client.table("boq_sections").insert(
        {"project_id": project_id, **section.model_dump()}
    ).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="BOQ section could not be created")
    return _section_response(result.data[0])


@router.get("/sections", response_model=list[BOQSectionResponse])
def list_sections(project_id: str) -> list[BOQSectionResponse]:
    client = get_supabase()
    result = client.table("boq_sections").select("*").eq("project_id", project_id).order("sort_order").execute()
    return [_section_response(row) for row in result.data]


@router.put("/sections/{section_id}", response_model=BOQSectionResponse)
def update_section(project_id: str, section_id: str, section: BOQSectionCreate) -> BOQSectionResponse:
    client = get_supabase()
    result = client.table("boq_sections").update(section.model_dump()).eq(
        "id", section_id
    ).eq("project_id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="BOQ section not found")
    return _section_response(result.data[0])


@router.delete("/sections/{section_id}", status_code=204)
def delete_section(project_id: str, section_id: str) -> None:
    client = get_supabase()
    result = client.table("boq_sections").delete().eq("id", section_id).eq("project_id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="BOQ section not found")


@router.post("", response_model=BOQItemResponse, status_code=201)
def create_boq_item(project_id: str, item: BOQItemCreate) -> BOQItemResponse:
    client = get_supabase()
    unit_rate = _resolve_unit_rate(client, item)
    payload = {"project_id": project_id, **item.model_dump(), "unit_rate": unit_rate}
    result = client.table("boq_items").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="BOQ item could not be created")
    return _item_response(result.data[0])


@router.get("", response_model=list[BOQItemResponse])
def list_boq_items(project_id: str) -> list[BOQItemResponse]:
    client = get_supabase()
    result = client.table("boq_items").select("*").eq("project_id", project_id).order("item_no").execute()
    return [_item_response(row) for row in result.data]


@router.put("/{item_id}", response_model=BOQItemResponse)
def update_boq_item(project_id: str, item_id: str, item: BOQItemCreate) -> BOQItemResponse:
    client = get_supabase()
    unit_rate = _resolve_unit_rate(client, item)
    payload = {**item.model_dump(), "unit_rate": unit_rate}
    result = client.table("boq_items").update(payload).eq("id", item_id).eq(
        "project_id", project_id
    ).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="BOQ item not found")
    return _item_response(result.data[0])


@router.delete("/{item_id}", status_code=204)
def delete_boq_item(project_id: str, item_id: str) -> None:
    client = get_supabase()
    result = client.table("boq_items").delete().eq("id", item_id).eq(
        "project_id", project_id
    ).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="BOQ item not found")
