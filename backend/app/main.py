import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.boq import router as boq_router
from app.api.categories import router as categories_router
from app.api.estimates import router as estimates_router
from app.api.estimate_versions import router as estimate_versions_router
from app.api.exports import router as exports_router
from app.api.pdf_export import router as pdf_export_router
from app.api.projects import router as projects_router
from app.api.rate_analysis import router as rate_analysis_router
from app.api.rates import router as rates_router
from app.api.summary import router as summary_router

app = FastAPI(
    title="Construction Cost Estimation API",
    version="0.8.0",
    description="API for construction quantity takeoff, BOQ, cost rates, rate analysis, summaries, estimate versions and exports.",
)

# Allow Vercel (and local) frontends to call the API
_default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
_extra = os.environ.get("CORS_ORIGINS", "")
_origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(exports_router)
app.include_router(pdf_export_router)
