from dataclasses import dataclass
from decimal import Decimal

from app.services.calculation import calculate_breakdown


@dataclass
class EstimateItem:
    description: str
    quantity: Decimal
    unit: str
    unit_rate: Decimal

    @property
    def amount(self) -> Decimal:
        return self.quantity * self.unit_rate


def calculate_total(
    items: list[EstimateItem],
    overhead_percent: Decimal = Decimal("0"),
    profit_percent: Decimal = Decimal("0"),
    contingency_percent: Decimal = Decimal("0"),
) -> Decimal:
    subtotal = sum((item.amount for item in items), Decimal("0"))
    return calculate_breakdown(
        subtotal,
        overhead_percent,
        profit_percent,
        contingency_percent,
    )["total"]
