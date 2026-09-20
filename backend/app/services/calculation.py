from decimal import Decimal, ROUND_HALF_UP

TWOPLACES = Decimal("0.01")


def money(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def percentage(base: Decimal, rate: Decimal) -> Decimal:
    return base * rate / Decimal("100")


def calculate_breakdown(
    subtotal: Decimal,
    overhead_percent: Decimal = Decimal("0"),
    profit_percent: Decimal = Decimal("0"),
    contingency_percent: Decimal = Decimal("0"),
) -> dict[str, Decimal]:
    overhead = percentage(subtotal, overhead_percent)
    profit_base = subtotal + overhead
    profit = percentage(profit_base, profit_percent)
    contingency_base = profit_base + profit
    contingency = percentage(contingency_base, contingency_percent)
    return {
        "subtotal": money(subtotal),
        "overhead": money(overhead),
        "profit": money(profit),
        "contingency": money(contingency),
        "total": money(subtotal + overhead + profit + contingency),
    }
