from fastapi import APIRouter, HTTPException

from app.db import get_supabase
from app.schemas.boq import BOQItemCreate, BOQItemResponse

router = APIRouter(prefix="/projects/{project_id}/boq", tags=["boq"])


def _response(row: dict) -> BOQItemResponse:
    return BOQItemResponse(
        id=str(row["id"]),
        item_no=row["item_no"],
        description=row["description"],
        unit=row["unit"],
        quantity=row["quantity"],
        unit_rate=row["unit_rate"],
        amount=row["amount"],
    )


@router.post("", response_model=BOQItemResponse, status_code=201)
def create_boq_item(project_id: str, item: BOQItemCreate) -> BOQItemResponse:
    client = get_supabase()
    result = client.table("boq_items").insert({"project_id": project_id, **item.model_dump()}).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="BOQ item could not be created")
    return _response(result.data[0])


@router.get("", response_model=list[BOQItemResponse])
def list_boq_items(project_id: str) -> list[BOQItemResponse]:
    client = get_supabase()
    result = client.table("boq_items").select("*").eq("project_id", project_id).order("item_no").execute()
    return [_response(row) for row in result.data]


@router.put("/{item_id}", response_model=BOQItemResponse)
def update_boq_item(project_id: str, item_id: str, item: BOQItemCreate) -> BOQItemResponse:
    client = get_supabase()
    result = (client.table("boq_items").update(item.model_dump()).eq("id", item_id).eq("project_id", project_id).execute())
    if not result.data:
        raise HTTPException(status_code=404, detail="BOQ item not found")
    return _response(result.data[0])


@router.delete("/{item_id}", status_code=204)
def delete_boq_item(project_id: str, item_id: str) -> None:
    client = get_supabase()
    result = client.table("boq_items").delete().eq("id", item_id).eq("project_id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="BOQ item not found")
