# Frontend (v0.9)

React + Vite + TypeScript UI for the Construction Cost Estimation system.

## Highlights

- Shared **AppContext** (active project, toasts, boot loading)
- Grouped **sidebar** with collapse + mobile drawer
- **Categories** management
- **BOQ** sections, filters, delete, Excel/PDF export
- **Rate Analysis**, **Estimate Versions**, **Summary**
- Design system with Inter, cards, tables, toasts

## Pages

| Page | Purpose |
|------|---------|
| Dashboard | Workflow + quick actions |
| Projects | Create / list / set active project |
| BOQ | Takeoff + sections + exports |
| Categories | Cost categories |
| Rates | Unit rates |
| Rate Analysis | Composite rates + waste |
| Estimate Versions | Frozen snapshots |
| Summary | Live totals + markups |

## Run

```bash
cd frontend
npm install
npm run dev
```

```bash
export VITE_API_BASE_URL=http://localhost:8000
```

## Deploy (Vercel)

- Root: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://your-api-url`
