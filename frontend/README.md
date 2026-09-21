# Frontend

React + Vite + TypeScript UI for the Construction Cost Estimation system.

## Pages

- **Dashboard** – overview and workflow guidance
- **Projects** – create and list projects
- **BOQ** – quantity takeoff items (manual rate or from rate analysis)
- **Rates** – material / labor / equipment unit rates
- **Rate Analysis** – composite rates built from components + waste
- **Estimate Versions** – frozen BOQ snapshots with overhead / profit / contingency
- **Summary** – live cost summary with adjustable markups

## Run

```bash
cd frontend
npm install
npm run dev
```

Set the API base URL if needed:

```bash
export VITE_API_BASE_URL=http://localhost:8000
```

## Deploy (Vercel)

- Root Directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://your-api-url`
