from fastapi import FastAPI

from app.api.estimates import router as estimates_router

app = FastAPI(
    title="Construction Cost Estimation API",
    version="0.1.0",
    description="API for construction quantity takeoff, BOQ and cost estimation.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

app.include_router(estimates_router)
