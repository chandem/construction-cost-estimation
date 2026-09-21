type ErrorBannerProps = {
  message: string;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div style={{ padding: 40 }}>
      <div className="error">{message}</div>
      <p className="muted" style={{ marginTop: 12 }}>
        Check that the API is running and SUPABASE credentials are configured.
      </p>
    </div>
  );
}
