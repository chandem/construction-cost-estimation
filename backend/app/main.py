from fastapi import FastAPI

from app.api.boq import router as boq_router
from app.api.estimates import router as estimates_router
from app.api.projects import router as projects_router

app = FastAPI(
    title="Construction Cost Estimation API",
    version="0.1.0",
    description="API for construction quantity takeoff, BOQ and cost estimation.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(estimates_router)
app.include_router(projects_router)
app.include_router(boq_router)
