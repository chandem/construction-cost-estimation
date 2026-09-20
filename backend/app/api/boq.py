from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.boq import BOQItemCreate, BOQItemResponse

router = APIRouter(prefix="/projects/{project_id}/boq", tags=["boq"])

_boq_items: dict[str, list[BOQItemResponse]] = {}


def _get_items(project_id: str) -> list[BOQItemResponse]:
    return _boq_items.setdefault(project_id, [])


@router.post("", response_model=BOQItemResponse, status_code=201)
def create_boq_item(project_id: str, item: BOQItemCreate) -> BOQItemResponse:
    items = _get_items(project_id)
    if any(existing.item_no == item.item_no for existing in items):
        raise HTTPException(status_code=409, detail="Item number already exists")

    result = BOQItemResponse(
        id=str(uuid4()),
        **item.model_dump(),
        amount=(item.quantity * item.unit_rate).quantize(Decimal("0.01")),
    )
    items.append(result)
    return result


@router.get("", response_model=list[BOQItemResponse])
def list_boq_items(project_id: str) -> list[BOQItemResponse]:
    return sorted(_get_items(project_id), key=lambda item: item.item_no)


@router.put("/{item_id}", response_model=BOQItemResponse)
def update_boq_item(
    project_id: str, item_id: str, item: BOQItemCreate
) -> BOQItemResponse:
    items = _get_items(project_id)
    for index, existing in enumerate(items):
        if existing.id == item_id:
            if any(
                other.id != item_id and other.item_no == item.item_no
                for other in items
            ):
                raise HTTPException(status_code=409, detail="Item number already exists")

            result = BOQItemResponse(
                id=item_id,
                **item.model_dump(),
                amount=(item.quantity * item.unit_rate).quantize(Decimal("0.01")),
            )
            items[index] = result
            return result
    raise HTTPException(status_code=404, detail="BOQ item not found")


@router.delete("/{item_id}", status_code=204)
def delete_boq_item(project_id: str, item_id: str) -> None:
    items = _get_items(project_id)
    for index, existing in enumerate(items):
        if existing.id == item_id:
            items.pop(index)
            return
    raise HTTPException(status_code=404, detail="BOQ item not found")
