import { useEffect, useState } from "react";
import { Plus, CircleDollarSign } from "lucide-react";
import { createRate, listRates, type CostRate } from "../../api/rates";
import { listCategories, type Category } from "../../api/categories";
import { useApp } from "../../context/AppContext";
import { fmtNum } from "../../lib/format";

export default function RatesPage() {
  const { pushToast } = useApp();
  const [rates, setRates] = useState<CostRate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("m³");
  const [rate, setRate] = useState("0");
  const [region, setRegion] = useState("Addis Ababa");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [rateRows, categoryRows] = await Promise.all([listRates(), listCategories()]);
      setRates(rateRows);
      setCategories(categoryRows);
      if (categoryRows.length && !categoryId) setCategoryId(categoryRows[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateRate() {
    if (!categoryId || !code.trim() || !name.trim()) return;
    setSaving(true);
    try {
      const created = await createRate({
        category_id: categoryId,
        code: code.trim(),
        name: name.trim(),
        unit,
        rate: Number(rate),
        currency: "ETB",
        region: region.trim() || null,
      });
      setRates((current) => [...current, created]);
      setCode("");
      setName("");
      setUnit("m³");
      setRate("0");
      setShowForm(false);
      pushToast("success", "Cost rate created");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create rate");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Cost rates</h2>
          <p className="muted">Material, labor and equipment unit rates by region.</p>
        </div>
        <button type="button" className="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} />
          {showForm ? "Cancel" : "Add rate"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <section className="panel form">
          <h3>New cost rate</h3>
          <div className="formGrid">
            <label>
              Category *
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.length === 0 ? (
                  <option value="">Create categories first</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              Code *
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CEM-OPC" />
            </label>
            <label className="wide">
              Name *
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ordinary Portland Cement" />
            </label>
            <label>
              Unit
              <input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
            <label>
              Rate (ETB)
              <input type="number" step="0.01" min={0} value={rate} onChange={(e) => setRate(e.target.value)} />
            </label>
            <label>
              Region
              <input value={region} onChange={(e) => setRegion(e.target.value)} />
            </label>
          </div>
          <div className="formActions">
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              disabled={saving || !categoryId || !code.trim() || !name.trim()}
              onClick={() => void handleCreateRate()}
            >
              {saving ? "Saving…" : "Add rate"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>Unit rates</h3>
          <button type="button" className="secondary" onClick={() => void loadAll()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {loading && rates.length === 0 ? (
          <div className="emptySmall">Loading rates…</div>
        ) : rates.length === 0 ? (
          <div className="emptySmall">
            <CircleDollarSign size={28} />
            <strong>No rates yet</strong>
            <span>Add categories first, then material / labor / equipment rates.</span>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Unit</th>
                  <th className="num">Rate</th>
                  <th>Currency</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.id}>
                    <td>{r.code}</td>
                    <td>{r.name}</td>
                    <td>{r.unit}</td>
                    <td className="num money">{fmtNum(r.rate)}</td>
                    <td>{r.currency}</td>
                    <td>{r.region || "—"}</td>
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
