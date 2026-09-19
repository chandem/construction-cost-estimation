from decimal import Decimal

from fastapi import APIRouter

from app.models.estimate import EstimateItem, calculate_total
from app.schemas.estimate import (
    EstimateCalculateRequest,
    EstimateCalculateResponse,
    EstimateItemResult,
)

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
    overhead = subtotal * request.overhead_percent / Decimal("100")
    profit = (subtotal + overhead) * request.profit_percent / Decimal("100")
    contingency = (
        (subtotal + overhead + profit)
        * request.contingency_percent
        / Decimal("100")
    )
    total = calculate_total(
        items,
        request.overhead_percent,
        request.profit_percent,
        request.contingency_percent,
    )

    return EstimateCalculateResponse(
        subtotal=subtotal,
        overhead=overhead,
        profit=profit,
        contingency=contingency,
        total=total,
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
