from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_supabase

router = APIRouter(prefix="/cost-categories", tags=["cost-categories"])


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


class CategoryResponse(CategoryCreate):
    id: str


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryCreate) -> CategoryResponse:
    client = get_supabase()
    result = client.table("cost_categories").insert(category.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Cost category could not be created")
    row = result.data[0]
    return CategoryResponse(id=str(row["id"]), name=row["name"], description=row.get("description"))


@router.get("", response_model=list[CategoryResponse])
def list_categories() -> list[CategoryResponse]:
    client = get_supabase()
    result = client.table("cost_categories").select("*").order("name").execute()
    return [
        CategoryResponse(id=str(row["id"]), name=row["name"], description=row.get("description"))
        for row in result.data
    ]


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: str, category: CategoryCreate) -> CategoryResponse:
    client = get_supabase()
    result = (
        client.table("cost_categories")
        .update(category.model_dump())
        .eq("id", category_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Cost category not found")
    row = result.data[0]
    return CategoryResponse(id=str(row["id"]), name=row["name"], description=row.get("description"))


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: str) -> None:
    client = get_supabase()
    result = client.table("cost_categories").delete().eq("id", category_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Cost category not found")
