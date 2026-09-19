# Backend

FastAPI service for the Construction Cost Estimation System.

## Run locally

From the repository root:

```bash
pip install -r requirements.txt
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

Health check:

```text
GET /health
```

Run tests:

```bash
pytest backend/tests
```
