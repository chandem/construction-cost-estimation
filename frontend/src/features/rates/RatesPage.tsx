import { useState } from "react";
import { createRate, listRates, type CostRate } from "../../api/rates";

type RatesPageProps = {
  projectsCount?: number;
};

export default function RatesPage({ projectsCount = 0 }: RatesPageProps) {
  const [rates, setRates] = useState<CostRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [unit, setUnit] = useState("m3");
  const [rate, setRate] = useState("0");

  async function loadRates() {
    setLoading(true);
    setError("");
    try {
      const rows = await listRates();
      setRates(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rates");
      setRates([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRate() {
    setSaving(true);
    setError("");
    try {
      const created = await createRate({
        category_id: "00000000-0000-0000-0000-000000000000",
        code,
        name,
        unit,
        rate: Number(rate),
        currency: "ETB",
        region: "Addis Ababa",
      });
      setRates((current) => [...current, created]);
      setName("");
      setCode("");
      setUnit("m3");
      setRate("0");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rate");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h2>Cost Rates</h2>
      <p className="muted">Projects tracked: {projectsCount}</p>
      {error && <div className="error-banner">{error}</div>}

      <div className="boq-form">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Rate code" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rate name" />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" />
        <input
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate"
        />
        <button onClick={() => void handleCreateRate()} disabled={saving || !name || !code}>
          {saving ? "Saving..." : "Add rate"}
        </button>
      </div>

      <button onClick={() => void loadRates()} disabled={loading}>
        {loading ? "Loading..." : "Refresh rates"}
      </button>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr>
              <td colSpan={5}>No rates available.</td>
            </tr>
          ) : (
            rates.map((rateItem) => (
              <tr key={rateItem.id}>
                <td>{rateItem.code}</td>
                <td>{rateItem.name}</td>
                <td>{rateItem.unit}</td>
                <td>{rateItem.rate}</td>
                <td>{rateItem.currency}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
