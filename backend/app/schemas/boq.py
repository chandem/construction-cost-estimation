from decimal import Decimal

from pydantic import BaseModel, Field


class BOQSectionCreate(BaseModel):
    name: str = Field(min_length=1)
    code: str | None = None
    description: str | None = None
    sort_order: int = Field(default=0, ge=0)


class BOQSectionResponse(BOQSectionCreate):
    id: str
    project_id: str


class BOQItemCreate(BaseModel):
    item_no: int = Field(ge=1)
    description: str = Field(min_length=1)
    unit: str = Field(min_length=1)
    quantity: Decimal = Field(gt=0)
    unit_rate: Decimal = Field(ge=0)
    rate_analysis_id: str | None = None
    section_id: str | None = None


class BOQItemResponse(BOQItemCreate):
    id: str
    amount: Decimal
