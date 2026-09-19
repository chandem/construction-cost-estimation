from dataclasses import dataclass
from decimal import Decimal


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
    overhead = subtotal * overhead_percent / Decimal("100")
    profit = (subtotal + overhead) * profit_percent / Decimal("100")
    contingency = (subtotal + overhead + profit) * contingency_percent / Decimal("100")
    return subtotal + overhead + profit + contingency
