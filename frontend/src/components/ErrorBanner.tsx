type ErrorBannerProps = {
  message: string;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div style={{ padding: 40, maxWidth: 720 }}>
      <div className="error">{message}</div>
      <div className="muted" style={{ marginTop: 16, lineHeight: 1.7 }}>
        <strong style={{ color: "#374151" }}>How to fix</strong>
        <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li>
            Start the API locally:
            <pre style={{ margin: "6px 0", background: "#f3f4f6", padding: 10, borderRadius: 8, fontSize: 13 }}>
{`export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000`}
            </pre>
          </li>
          <li>
            Confirm health: open{" "}
            <a href="http://localhost:8000/health" target="_blank" rel="noreferrer">
              http://localhost:8000/health
            </a>{" "}
            — should return <code>{"{\"status\":\"ok\"}"}</code>
          </li>
          <li>
            If the UI is on Vercel, set <code>VITE_API_BASE_URL</code> to your deployed API URL and redeploy.
          </li>
          <li>
            On the API host, set <code>CORS_ORIGINS</code> to your frontend origin (e.g. your Vercel URL).
          </li>
          <li>
            Apply <code>database/schema.sql</code> in Supabase and use the service role key on the API only.
          </li>
        </ol>
      </div>
    </div>
  );
}
