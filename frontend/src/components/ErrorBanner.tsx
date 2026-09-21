type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bootScreen">
      <div className="bootCard errorCard">
        <div className="brandMark large">CE</div>
        <h2>Cannot reach the API</h2>
        <div className="error">{message}</div>
        <ol className="helpList">
          <li>Confirm the Render API is awake: open <code>/health</code></li>
          <li>Set <code>VITE_API_BASE_URL</code> on Vercel and redeploy</li>
          <li>Ensure Supabase URL and service role key are set on the API</li>
        </ol>
        {onRetry && (
          <button type="button" className="primary" onClick={onRetry}>
            Retry connection
          </button>
        )}
      </div>
    </div>
  );
}
