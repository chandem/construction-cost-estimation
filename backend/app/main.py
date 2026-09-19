from fastapi import FastAPI

app = FastAPI(
    title="Construction Cost Estimation API",
    version="0.1.0",
    description="API for construction quantity takeoff, BOQ and cost estimation.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
