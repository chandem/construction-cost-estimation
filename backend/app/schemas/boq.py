from decimal import Decimal

from pydantic import BaseModel, Field


class BOQItemCreate(BaseModel):
    item_no: int = Field(ge=1)
    description: str = Field(min_length=1)
    unit: str = Field(min_length=1)
    quantity: Decimal = Field(gt=0)
    unit_rate: Decimal = Field(ge=0)


class BOQItemResponse(BOQItemCreate):
    id: str
    amount: Decimal
