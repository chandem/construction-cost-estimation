from decimal import Decimal

from pydantic import BaseModel, Field


class EstimateItemCreate(BaseModel):
    description: str = Field(min_length=1)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1)
    unit_rate: Decimal = Field(ge=0)


class EstimateCalculateRequest(BaseModel):
    items: list[EstimateItemCreate]
    overhead_percent: Decimal = Field(default=0, ge=0, le=100)
    profit_percent: Decimal = Field(default=0, ge=0, le=100)
    contingency_percent: Decimal = Field(default=0, ge=0, le=100)


class EstimateItemResult(BaseModel):
    description: str
    quantity: Decimal
    unit: str
    unit_rate: Decimal
    amount: Decimal


class EstimateCalculateResponse(BaseModel):
    subtotal: Decimal
    overhead: Decimal
    profit: Decimal
    contingency: Decimal
    total: Decimal
    items: list[EstimateItemResult]
