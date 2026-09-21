export default function LoadingSpinner() {
  return (
    <div className="bootScreen">
      <div className="bootCard">
        <div className="brandMark large">CE</div>
        <div className="spinner" />
        <p>Connecting to estimation API…</p>
      </div>
    </div>
  );
}
