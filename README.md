# Construction Cost Estimation

A web-based construction estimating system for **quantity takeoff, unit-rate analysis, BOQ generation, and total project cost estimation**.

## Vision

Build a practical estimator that can start with manual quantities and rates, then grow into an Ethiopia-focused professional estimating platform with versioned cost data, reusable rate analysis, Excel/PDF exports, dashboards, and AI-assisted estimation.

## Core workflow

`Project → Sections → Quantity takeoff → Unit rates / Rate analysis → Amount → BOQ → Estimate version (with markups) → Total cost`

## Repository structure

```text
construction-cost-estimation/
├── backend/        # FastAPI API (v0.8.0)
├── frontend/       # React + Vite (deployable on Vercel)
├── database/       # PostgreSQL / Supabase schema
├── Dockerfile      # Backend container image
├── render.yaml     # Optional Render.com blueprint
├── requirements.txt
└── README.md
```

## Current status

**Phase 2/3 — Estimating engine & professional features (in progress)**

### Implemented
- FastAPI backend: projects, BOQ, cost rates, rate analysis, estimate versions, summary, Excel/PDF exports
- React frontend: Dashboard, Projects, BOQ, Rates, Rate Analysis, Summary
- Full database schema for Supabase/PostgreSQL
- CORS for cross-origin frontend
- Docker + Render config for API deployment
- Vercel-ready frontend (`frontend/vercel.json`)

### Still planned
- BOQ sections UI polish
- Estimate versions UI
- Ethiopia regional cost libraries
- Authentication & multi-user sharing
- Drawing-assisted takeoff / AI assist

---

## Deploy

### 1. Database (Supabase)

1. Create a Supabase project
2. Run `database/schema.sql` in the SQL editor
3. Copy **Project URL** and **service_role** key

### 2. Backend API (Render / Railway / any Docker host)

```bash
docker build -t construction-cost-api .
docker run -p 8000:8000 \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e CORS_ORIGINS=https://your-app.vercel.app \
  construction-cost-api
```

On **Render**: New Web Service → Docker → set the three env vars above. Health check: `/health`.

### 3. Frontend (Vercel)

1. Import `chandem/construction-cost-estimation`
2. **Root Directory:** `frontend`
3. Framework: Vite · Build: `npm run build` · Output: `dist`
4. Env var:
   ```
   VITE_API_BASE_URL=https://your-api.onrender.com
   ```
5. Deploy, then set `CORS_ORIGINS` on the API to your `*.vercel.app` URL and redeploy the API if needed.

---

## Local development

**Backend**

```bash
pip install -r requirements.txt
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Optional: `VITE_API_BASE_URL=http://localhost:8000`

**Tests**

```bash
pytest backend/tests
```
