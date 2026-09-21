import { useEffect, useState } from "react";
import { Plus, CircleDollarSign } from "lucide-react";
import { createRate, listRates, type CostRate } from "../../api/rates";
import { apiFetch } from "../../api/client";

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

type RatesPageProps = {
  projectsCount?: number;
};

export default function RatesPage({ projectsCount = 0 }: RatesPageProps) {
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

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [rateRows, categoryRows] = await Promise.all([
        listRates(),
        apiFetch<Category[]>("/cost-categories"),
      ]);
      setRates(rateRows);
      setCategories(categoryRows);
      if (categoryRows.length > 0 && !categoryId) {
        setCategoryId(categoryRows[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rates");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRate() {
    if (!categoryId || !code.trim() || !name.trim()) return;
    setSaving(true);
    setError("");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rate");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Cost Rates</h2>
          <p className="muted">
            Unit rates for materials, labor and equipment. Projects tracked: {projectsCount}.
          </p>
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
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  padding: "11px 12px",
                  borderRadius: 9,
                  border: "1px solid #d1d5db",
                  font: "inherit",
                }}
              >
                {categories.length === 0 ? (
                  <option value="">No categories — create some first</option>
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
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CEM-OPC"
              />
            </label>
            <label className="wide">
              Name *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ordinary Portland Cement"
              />
            </label>
            <label>
              Unit
              <input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
            <label>
              Rate (ETB)
              <input
                type="number"
                step="0.01"
                min={0}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </label>
            <label>
              Region
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Addis Ababa"
              />
            </label>
          </div>
          <div className="formActions">
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => void handleCreateRate()}
              disabled={saving || !categoryId || !code.trim() || !name.trim()}
            >
              {saving ? "Saving..." : "Add rate"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>Unit rates</h3>
          <button type="button" className="secondary" onClick={() => void loadAll()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && rates.length === 0 ? (
          <div className="emptySmall">Loading rates...</div>
        ) : rates.length === 0 ? (
          <div className="emptySmall">
            <CircleDollarSign size={28} />
            <strong>No rates yet</strong>
            <span>Add material, labor or equipment rates to use in rate analyses and BOQs.</span>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Unit</th>
                  <th>Rate</th>
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
                    <td>
                      {Number(r.rate).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
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
