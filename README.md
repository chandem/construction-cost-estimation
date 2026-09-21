# Construction Cost Estimation

A web-based construction estimating system for **quantity takeoff, unit-rate analysis, BOQ generation, and total project cost estimation**.

## Vision

Build a practical estimator that can start with manual quantities and rates, then grow into an Ethiopia-focused professional estimating platform with versioned cost data, reusable rate analysis, Excel/PDF exports, dashboards, and AI-assisted estimation.

## Core workflow

`Project → Building elements / Sections → Quantity takeoff → Unit rates / Rate analysis → Amount → BOQ → Estimate version (with markups) → Total cost`

## Repository structure

```text
construction-cost-estimation/
├── backend/        # FastAPI API (v0.8.0)
├── frontend/       # React web application
├── database/       # PostgreSQL / Supabase schema
├── calculations/   # Quantity and cost calculation engine
├── boq/            # Bill of Quantities logic
├── cost-data/      # Versioned material/labor/equipment rates
├── docs/           # Architecture and estimating methodology
├── requirements.txt
└── README.md
```

## Current status

**Phase 2/3 — Estimating engine & professional features (in progress)**

### Implemented
- FastAPI backend with routers for:
  - Projects
  - BOQ sections & items
  - Cost categories & rates
  - Rate analysis (components + waste)
  - Estimate versions (snapshots + overhead / profit / contingency)
  - Summary, Excel & PDF exports
- React frontend with Dashboard, Projects, BOQ, Rates and Summary pages
- Comprehensive database schema (projects, cost_categories, cost_rates, rate_analyses, boq_sections, boq_items, estimate_versions, …)
- Automated tests with FakeSupabase
- CI workflow

### Still planned / incomplete
- Full rate analysis UI integration
- Drawing-assisted quantity takeoff
- Ethiopia regional cost libraries
- Authentication & multi-user project sharing
- AI-assisted estimation & anomaly detection

## Backend quick start

```bash
pip install -r requirements.txt
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

Health endpoint:

```text
GET /health
```

Tests:

```bash
pytest backend/tests
```

## Database

See `database/schema.sql` for the full PostgreSQL/Supabase schema covering:

- Projects
- Cost categories & rates
- Rate analyses & components
- BOQ sections & items
- Estimate versions & snapshot items

## Frontend

```bash
cd frontend
npm install
npm run dev
```
