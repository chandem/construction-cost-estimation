import { useEffect, useState } from "react";
import { Plus, Layers, Trash2 } from "lucide-react";
import {
  createRateAnalysis,
  listRateAnalyses,
  type RateAnalysis,
} from "../../api/rateAnalysis";
import { listRates, type CostRate } from "../../api/rates";

type ComponentDraft = {
  key: string;
  cost_rate_id: string;
  quantity: string;
  waste_percent: string;
};

export default function RateAnalysisPage() {
  const [analyses, setAnalyses] = useState<RateAnalysis[]>([]);
  const [rates, setRates] = useState<CostRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("m³");
  const [region, setRegion] = useState("Addis Ababa");
  const [components, setComponents] = useState<ComponentDraft[]>([
    { key: crypto.randomUUID(), cost_rate_id: "", quantity: "1", waste_percent: "0" },
  ]);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [analysisRows, rateRows] = await Promise.all([
        listRateAnalyses(),
        listRates(),
      ]);
      setAnalyses(analysisRows);
      setRates(rateRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rate analyses");
    } finally {
      setLoading(false);
    }
  }

  function addComponent() {
    setComponents((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        cost_rate_id: rates[0]?.id ?? "",
        quantity: "1",
        waste_percent: "0",
      },
    ]);
  }

  function removeComponent(key: string) {
    setComponents((prev) => (prev.length <= 1 ? prev : prev.filter((c) => c.key !== key)));
  }

  function updateComponent(key: string, field: keyof ComponentDraft, value: string) {
    setComponents((prev) =>
      prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)),
    );
  }

  async function handleCreate() {
    if (!code.trim() || !description.trim()) return;
    const validComponents = components.filter((c) => c.cost_rate_id && Number(c.quantity) >= 0);
    if (validComponents.length === 0) {
      setError("Add at least one component with a cost rate.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const created = await createRateAnalysis({
        code: code.trim(),
        description: description.trim(),
        unit,
        region: region.trim() || null,
        currency: "ETB",
        components: validComponents.map((c) => ({
          cost_rate_id: c.cost_rate_id,
          quantity: Number(c.quantity),
          waste_percent: Number(c.waste_percent) || 0,
        })),
      });
      setAnalyses((prev) => [...prev, created]);
      setCode("");
      setDescription("");
      setUnit("m³");
      setRegion("Addis Ababa");
      setComponents([
        { key: crypto.randomUUID(), cost_rate_id: rates[0]?.id ?? "", quantity: "1", waste_percent: "0" },
      ]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rate analysis");
    } finally {
      setSaving(false);
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rateName = (id: string) => rates.find((r) => r.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Rate Analysis</h2>
          <p className="muted">
            Build composite unit rates from material, labor and equipment components with waste.
          </p>
        </div>
        <button type="button" className="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} />
          {showForm ? "Cancel" : "New analysis"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <section className="panel form">
          <h3>New rate analysis</h3>
          <div className="formGrid">
            <label>
              Code *
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. RC-C25-M3"
              />
            </label>
            <label>
              Unit
              <input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
            <label className="wide">
              Description *
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Reinforced concrete C25 per m³"
              />
            </label>
            <label>
              Region
              <input value={region} onChange={(e) => setRegion(e.target.value)} />
            </label>
          </div>

          <h3 style={{ marginTop: 24 }}>Components</h3>
          {rates.length === 0 && (
            <p className="muted">
              No cost rates found. Add rates under Cost Rates first.
            </p>
          )}

          <div className="stack" style={{ gap: 12 }}>
            {components.map((comp) => (
              <div
                key={comp.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Cost rate
                  <select
                    value={comp.cost_rate_id}
                    onChange={(e) => updateComponent(comp.key, "cost_rate_id", e.target.value)}
                    style={{
                      padding: "11px 12px",
                      borderRadius: 9,
                      border: "1px solid #d1d5db",
                      font: "inherit",
                      fontWeight: 400,
                    }}
                  >
                    <option value="">Select rate</option>
                    {rates.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} — {r.name} ({fmt(Number(r.rate))} / {r.unit})
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Quantity
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    value={comp.quantity}
                    onChange={(e) => updateComponent(comp.key, "quantity", e.target.value)}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Waste %
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={comp.waste_percent}
                    onChange={(e) => updateComponent(comp.key, "waste_percent", e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => removeComponent(comp.key)}
                  title="Remove component"
                  style={{ padding: "11px 12px" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="button" className="secondary" onClick={addComponent}>
              <Plus size={14} /> Add component
            </button>
          </div>

          <div className="formActions">
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => void handleCreate()}
              disabled={saving || !code.trim() || !description.trim()}
            >
              {saving ? "Saving..." : "Create analysis"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>Rate analyses</h3>
          <button type="button" className="secondary" onClick={() => void loadAll()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && analyses.length === 0 ? (
          <div className="emptySmall">Loading...</div>
        ) : analyses.length === 0 ? (
          <div className="emptySmall">
            <Layers size={28} />
            <strong>No rate analyses yet</strong>
            <span>Compose unit rates from cost rate components with waste factors.</span>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Components</th>
                  <th>Direct cost</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.code}</strong>
                    </td>
                    <td>
                      {a.description}
                      {a.components.length > 0 && (
                        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                          {a.components
                            .map(
                              (c) =>
                                `${rateName(c.cost_rate_id)} × ${c.quantity}` +
                                (c.waste_percent ? ` (+${c.waste_percent}% waste)` : ""),
                            )
                            .join(" · ")}
                        </div>
                      )}
                    </td>
                    <td>{a.unit}</td>
                    <td>{a.components.length}</td>
                    <td>
                      <strong>{fmt(Number(a.direct_cost))}</strong> {a.currency}
                    </td>
                    <td>{a.region || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
