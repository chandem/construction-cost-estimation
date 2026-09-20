from decimal import Decimal

from app.services.calculation import calculate_breakdown


def test_calculation_breakdown() -> None:
    result = calculate_breakdown(
        Decimal("40000"),
        Decimal("10"),
        Decimal("5"),
        Decimal("3"),
    )
    assert result["subtotal"] == Decimal("40000.00")
    assert result["overhead"] == Decimal("4000.00")
    assert result["profit"] == Decimal("2200.00")
    assert result["contingency"] == Decimal("1386.00")
    assert result["total"] == Decimal("47586.00")
