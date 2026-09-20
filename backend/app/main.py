from fastapi import FastAPI

from app.api.boq import router as boq_router
from app.api.categories import router as categories_router
from app.api.estimates import router as estimates_router
from app.api.estimate_versions import router as estimate_versions_router
from app.api.projects import router as projects_router
from app.api.rate_analysis import router as rate_analysis_router
from app.api.rates import router as rates_router
from app.api.summary import router as summary_router

app = FastAPI(
    title="Construction Cost Estimation API",
    version="0.6.0",
    description="API for construction quantity takeoff, BOQ, cost rates, rate analysis, summaries and estimate versions.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(estimates_router)
app.include_router(projects_router)
app.include_router(boq_router)
app.include_router(categories_router)
app.include_router(rates_router)
app.include_router(rate_analysis_router)
app.include_router(summary_router)
app.include_router(estimate_versions_router)
