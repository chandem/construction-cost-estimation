from decimal import Decimal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_supabase

router = APIRouter(prefix="/rates", tags=["rates"])


class CostRateCreate(BaseModel):
    category_id: str
    code: str = Field(min_length=1)
    name: str = Field(min_length=1)
    unit: str = Field(min_length=1)
    rate: Decimal = Field(ge=0)
    currency: str = Field(default="ETB", min_length=3, max_length=3)
    region: str | None = None
    source: str | None = None
    effective_date: str | None = None
    notes: str | None = None


class CostRateResponse(CostRateCreate):
    id: str


def _response(row: dict) -> CostRateResponse:
    return CostRateResponse(
        id=str(row["id"]),
        **{k: row.get(k) for k in CostRateCreate.model_fields},
    )


@router.post("", response_model=CostRateResponse, status_code=201)
def create_rate(rate: CostRateCreate) -> CostRateResponse:
    client = get_supabase()
    result = client.table("cost_rates").insert(rate.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Cost rate could not be created")
    return _response(result.data[0])


@router.get("", response_model=list[CostRateResponse])
def list_rates(
    region: str | None = None, category_id: str | None = None
) -> list[CostRateResponse]:
    client = get_supabase()
    query = client.table("cost_rates").select("*").order("name")
    if region:
        query = query.eq("region", region)
    if category_id:
        query = query.eq("category_id", category_id)
    result = query.execute()
    return [_response(row) for row in result.data]


@router.put("/{rate_id}", response_model=CostRateResponse)
def update_rate(rate_id: str, rate: CostRateCreate) -> CostRateResponse:
    client = get_supabase()
    result = client.table("cost_rates").update(rate.model_dump()).eq("id", rate_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Cost rate not found")
    return _response(result.data[0])


@router.delete("/{rate_id}", status_code=204)
def delete_rate(rate_id: str) -> None:
    client = get_supabase()
    result = client.table("cost_rates").delete().eq("id", rate_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Cost rate not found")
