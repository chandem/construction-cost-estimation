# Backend (v0.9.0)

FastAPI service for the Construction Cost Estimation System.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only) |
| `CORS_ORIGINS` | Optional | Extra allowed origins (comma-separated) |
| `PORT` | No | Defaults to 8000 |

Apply `database/schema.sql` in Supabase before first use.

## Run

```bash
pip install -r requirements.txt
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

## Key endpoints

- `GET /health` — status, version, supabase_configured
- `GET /dashboard/stats` — aggregate counts and total direct cost
- `POST /seed/ethiopia-defaults` — Material/Labor/Equipment + sample Addis rates
- `GET|POST|PUT|DELETE /projects` — full project CRUD
- BOQ, rates, rate analyses, estimate versions, summary, exports (Excel/PDF)

OpenAPI docs: `/docs`

## Tests

```bash
pytest backend/tests
```

## Docker

```bash
docker build -t construction-cost-api .
docker run -p 8000:8000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e CORS_ORIGINS=https://your-app.vercel.app \
  construction-cost-api
```
