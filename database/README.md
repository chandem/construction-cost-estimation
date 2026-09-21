# Database

PostgreSQL / Supabase schema for the Construction Cost Estimation system.

## File

- `schema.sql` – full schema

## Tables

| Table | Purpose |
|-------|---------|
| `projects` | Construction projects |
| `cost_categories` | Material / Labor / Equipment categories |
| `cost_rates` | Unit rates (with region & effective date) |
| `rate_analyses` | Assembled composite rates |
| `rate_analysis_components` | Material/labor/equipment components + waste |
| `boq_sections` | BOQ chapters / work packages |
| `boq_items` | Quantity takeoff items linked to rates or rate analyses |
| `estimate_versions` | Versioned snapshots with overhead / profit / contingency |
| `estimate_version_items` | Frozen BOQ lines at the time of the version |
| `estimate_items` | Legacy simple estimate lines (kept for compatibility) |

Apply with:

```bash
psql $DATABASE_URL -f database/schema.sql
```
or paste into the Supabase SQL editor.
