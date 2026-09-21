# Construction Cost Estimation

A web-based construction estimating system for **quantity takeoff, unit-rate analysis, BOQ generation, and total project cost estimation** — built for practical use on Ethiopian projects (ETB, regional rates).

## Core workflow

`Project → Categories & Rates → Rate analysis → BOQ sections & items → Estimate version → Summary / Export`

## Status — **v0.9**

### Backend (FastAPI 0.9.0)
- Projects CRUD (create, list, get, update, delete)
- Cost categories & unit rates
- Rate analysis with components + waste
- BOQ sections & items (linked rates)
- Estimate versions (frozen snapshots + markups)
- Project summary by section
- Excel & PDF BOQ export
- **Dashboard stats** (`GET /dashboard/stats`)
- **Ethiopia seed data** (`POST /seed/ethiopia-defaults`)
- Rich `/health` (version + Supabase config flag)
- CORS for local + `*.vercel.app`

### Frontend (React + Vite)
- App context (active project, toasts)
- Dashboard with live stats + seed button
- Projects, Categories, Rates, Rate Analysis
- BOQ with sections, filters, delete, Excel/PDF export
- Estimate Versions & Summary
- Mobile-friendly sidebar

### Infrastructure
- Supabase / PostgreSQL schema
- Docker + Render blueprint
- Vercel-ready frontend

---

## Deploy

### 1. Database (Supabase)
1. Create a project  
2. Run `database/schema.sql` in the SQL editor  
3. Copy **Project URL** and **service_role** key  

### 2. Backend (Render / Docker)

```bash
docker build -t construction-cost-api .
docker run -p 8000:8000 \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e CORS_ORIGINS=https://your-app.vercel.app \
  construction-cost-api
```

Health: `GET /health` → `{"status":"ok","version":"0.9.0",...}`

### 3. Frontend (Vercel)
- Root Directory: `frontend`  
- Build: `npm run build` · Output: `dist`  
- Env: `VITE_API_BASE_URL=https://your-api.onrender.com`  

### 4. First-run data
From the **Dashboard**, click **Seed Ethiopia sample rates**, or:

```bash
curl -X POST https://your-api.onrender.com/seed/ethiopia-defaults
```

Sample rates are illustrative — update to current market prices before tender use.

---

## Local development

```bash
# API
pip install -r requirements.txt
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000

# UI
cd frontend && npm install && npm run dev

# Tests
pytest backend/tests
```

## API highlights

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness + config |
| GET | `/dashboard/stats` | Overview metrics |
| POST | `/seed/ethiopia-defaults` | Categories + sample rates |
| CRUD | `/projects` | Projects |
| * | `/projects/{id}/boq` | Sections & items |
| * | `/rates`, `/rate-analyses` | Cost data |
| POST | `/projects/{id}/summary` | Marked-up totals |
| GET | `/projects/{id}/exports/boq.xlsx` | Excel |
| GET | `/projects/{id}/exports/boq.pdf` | PDF |
