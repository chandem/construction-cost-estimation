# Construction Cost Estimation

A web-based construction estimating system for **quantity takeoff, unit-rate analysis, BOQ generation, and total project cost estimation**.

## Vision

Build a practical estimator that can start with manual quantities and rates, then grow into an Ethiopia-focused professional estimating platform with versioned cost data, reusable rate analysis, Excel/PDF exports, dashboards, and AI-assisted estimation.

## Core workflow

`Project → Building elements → Quantity takeoff → Unit rates → Amount → BOQ → Total cost`

## Repository structure

```text
construction-cost-estimation/
├── backend/        # FastAPI API
├── frontend/       # Web application
├── database/       # Database design and migrations
├── calculations/   # Quantity and cost calculation engine
├── boq/            # Bill of Quantities logic
├── cost-data/      # Versioned material/labor/equipment rates
├── docs/           # Architecture and estimating methodology
├── requirements.txt
└── README.md
```

## Current status

**Phase 1 — Foundation**

- FastAPI backend initialized
- `GET /health` endpoint
- Automated health test
- Initial project modules and documentation structure

## Planned roadmap

### Phase 2 — Estimating engine
- Project and building-element models
- Quantity takeoff items
- Unit rates
- Quantity × rate amount calculations
- BOQ subtotals and totals

### Phase 3 — Professional estimating
- Material, labor and equipment rate database
- Rate analysis
- Wastage, overhead, profit and contingency
- Excel/PDF BOQ export
- Estimate revision/history
- Cost comparison and dashboards

### Phase 4 — Advanced platform
- User authentication and project management
- Drawing-assisted quantity takeoff
- Ethiopia-focused regional cost data
- AI-assisted estimation
- Estimate validation and anomaly detection

## Backend quick start

```bash
pip install -r requirements.txt
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
