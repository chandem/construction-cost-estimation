from decimal import Decimal

from fastapi import APIRouter

from app.models.estimate import EstimateItem
from app.schemas.estimate import (
    EstimateCalculateRequest,
    EstimateCalculateResponse,
    EstimateItemResult,
)
from app.services.calculation import calculate_breakdown

router = APIRouter(prefix="/estimates", tags=["estimates"])


@router.post("/calculate", response_model=EstimateCalculateResponse)
def calculate_estimate(request: EstimateCalculateRequest) -> EstimateCalculateResponse:
    items = [
        EstimateItem(
            description=item.description,
            quantity=item.quantity,
            unit=item.unit,
            unit_rate=item.unit_rate,
        )
        for item in request.items
    ]
    subtotal = sum((item.amount for item in items), Decimal("0"))
    breakdown = calculate_breakdown(
        subtotal,
        request.overhead_percent,
        request.profit_percent,
        request.contingency_percent,
    )

    return EstimateCalculateResponse(
        **breakdown,
        items=[
            EstimateItemResult(
                description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_rate=item.unit_rate,
                amount=item.amount,
            )
            for item in items
        ],
    )
