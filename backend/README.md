# Backend

FastAPI service for the Construction Cost Estimation System.

## Environment

Copy `.env.example` from the repo root and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side only) |
| `CORS_ORIGINS` | Recommended | Comma-separated frontend origins (e.g. Vercel URL) |
| `PORT` | No | Defaults to 8000 |

Apply `database/schema.sql` in the Supabase SQL editor before first use.

## Run locally

From the repository root:

```bash
pip install -r requirements.txt
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

Health check: `GET /health`

Tests:

```bash
pytest backend/tests
```

## Deploy (Docker)

```bash
docker build -t construction-cost-api .
docker run -p 8000:8000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e CORS_ORIGINS=https://your-app.vercel.app \
  construction-cost-api
```

### Render.com

1. New Web Service from this GitHub repo
2. Runtime: **Docker** (uses root `Dockerfile`)
3. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`
4. Health path: `/health`

Or use the included `render.yaml` blueprint.

### Railway / Fly.io

Point the service at the root `Dockerfile` and inject the same environment variables. Railway sets `PORT` automatically.
