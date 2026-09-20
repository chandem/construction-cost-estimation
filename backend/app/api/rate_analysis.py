from decimal import Decimal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_supabase

router = APIRouter(prefix="/rate-analyses", tags=["rate-analysis"])


class ComponentCreate(BaseModel):
    cost_rate_id: str
    quantity: Decimal = Field(ge=0)
    waste_percent: Decimal = Field(default=0, ge=0)


class RateAnalysisCreate(BaseModel):
    code: str = Field(min_length=1)
    description: str = Field(min_length=1)
    unit: str = Field(min_length=1)
    region: str | None = None
    currency: str = Field(default="ETB", min_length=3, max_length=3)
    components: list[ComponentCreate] = Field(default_factory=list)


class ComponentResponse(ComponentCreate):
    id: str
    unit_rate_snapshot: Decimal
    amount: Decimal


class RateAnalysisResponse(BaseModel):
    id: str
    code: str
    description: str
    unit: str
    region: str | None
    currency: str
    components: list[ComponentResponse]
    direct_cost: Decimal


@router.post("", response_model=RateAnalysisResponse, status_code=201)
def create_rate_analysis(data: RateAnalysisCreate) -> RateAnalysisResponse:
    client = get_supabase()

    analysis_result = client.table("rate_analyses").insert({
        "code": data.code,
        "description": data.description,
        "unit": data.unit,
        "region": data.region,
        "currency": data.currency,
    }).execute()
    if not analysis_result.data:
        raise HTTPException(status_code=500, detail="Rate analysis could not be created")

    analysis = analysis_result.data[0]
    rows = []

    for component in data.components:
        rate_result = (
            client.table("cost_rates")
            .select("rate")
            .eq("id", component.cost_rate_id)
            .limit(1)
            .execute()
        )
        if not rate_result.data:
            raise HTTPException(
                status_code=404,
                detail=f"Cost rate not found: {component.cost_rate_id}",
            )

        rate = Decimal(str(rate_result.data[0]["rate"]))
        rows.append({
            "rate_analysis_id": analysis["id"],
            "cost_rate_id": component.cost_rate_id,
            "quantity": component.quantity,
            "waste_percent": component.waste_percent,
            "unit_rate_snapshot": rate,
        })

    if rows:
        client.table("rate_analysis_components").insert(rows).execute()

    component_result = (
        client.table("rate_analysis_components")
        .select("*")
        .eq("rate_analysis_id", analysis["id"])
        .order("created_at")
        .execute()
    )

    components = [
        ComponentResponse(
            id=str(row["id"]),
            cost_rate_id=str(row["cost_rate_id"]),
            quantity=row["quantity"],
            waste_percent=row["waste_percent"],
            unit_rate_snapshot=row["unit_rate_snapshot"],
            amount=row["amount"],
        )
        for row in component_result.data
    ]

    direct_cost = sum((Decimal(str(item.amount)) for item in components), Decimal("0"))

    return RateAnalysisResponse(
        id=str(analysis["id"]),
        code=analysis["code"],
        description=analysis["description"],
        unit=analysis["unit"],
        region=analysis["region"],
        currency=analysis["currency"],
        components=components,
        direct_cost=direct_cost.quantize(Decimal("0.01")),
    )


@router.get("", response_model=list[RateAnalysisResponse])
def list_rate_analyses() -> list[RateAnalysisResponse]:
    client = get_supabase()
    analyses = client.table("rate_analyses").select("*").order("code").execute()

    output = []
    for analysis in analyses.data:
        component_result = (
            client.table("rate_analysis_components")
            .select("*")
            .eq("rate_analysis_id", analysis["id"])
            .order("created_at")
            .execute()
        )
        components = [
            ComponentResponse(
                id=str(row["id"]),
                cost_rate_id=str(row["cost_rate_id"]),
                quantity=row["quantity"],
                waste_percent=row["waste_percent"],
                unit_rate_snapshot=row["unit_rate_snapshot"],
                amount=row["amount"],
            )
            for row in component_result.data
        ]
        direct_cost = sum((Decimal(str(item.amount)) for item in components), Decimal("0"))
        output.append(
            RateAnalysisResponse(
                id=str(analysis["id"]),
                code=analysis["code"],
                description=analysis["description"],
                unit=analysis["unit"],
                region=analysis["region"],
                currency=analysis["currency"],
                components=components,
                direct_cost=direct_cost.quantize(Decimal("0.01")),
            )
        )
    return output
