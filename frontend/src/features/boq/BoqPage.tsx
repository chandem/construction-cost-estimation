import { useEffect, useState } from "react";
import { Plus, ClipboardList } from "lucide-react";
import { createBOQ, listBOQ, type BOQItem } from "../../api/boq";
import { listRateAnalyses, type RateAnalysis } from "../../api/rateAnalysis";
import { type Project } from "../../api/projects";

type BoqPageProps = {
  projects: Project[];
};

export default function BoqPage({ projects }: BoqPageProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [items, setItems] = useState<BOQItem[]>([]);
  const [analyses, setAnalyses] = useState<RateAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [itemNo, setItemNo] = useState("1");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("m³");
  const [quantity, setQuantity] = useState("1");
  const [unitRate, setUnitRate] = useState("0");
  const [rateAnalysisId, setRateAnalysisId] = useState("");

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    void listRateAnalyses()
      .then(setAnalyses)
      .catch(() => setAnalyses([]));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setItems([]);
      return;
    }
    void loadItems(selectedProjectId);
  }, [selectedProjectId]);

  async function loadItems(projectId: string) {
    setLoading(true);
    setError("");
    try {
      const rows = await listBOQ(projectId);
      setItems(rows);
      if (rows.length > 0) {
        const maxNo = Math.max(...rows.map((r) => r.item_no));
        setItemNo(String(maxNo + 1));
      } else {
        setItemNo("1");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load BOQ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function onSelectAnalysis(id: string) {
    setRateAnalysisId(id);
    if (id) {
      const analysis = analyses.find((a) => a.id === id);
      if (analysis) {
        setUnit(analysis.unit);
        setUnitRate(String(analysis.direct_cost));
        if (!description.trim()) {
          setDescription(analysis.description);
        }
      }
    }
  }

  async function handleCreateItem() {
    if (!selectedProjectId || !description.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload: Partial<BOQItem> = {
        item_no: Number(itemNo),
        description: description.trim(),
        unit,
        quantity: Number(quantity),
        unit_rate: Number(unitRate),
      };
      if (rateAnalysisId) {
        payload.rate_analysis_id = rateAnalysisId;
      }
      const created = await createBOQ(selectedProjectId, payload);
      setItems((current) => [...current, created].sort((a, b) => a.item_no - b.item_no));
      setDescription("");
      setQuantity("1");
      setUnitRate("0");
      setRateAnalysisId("");
      setItemNo(String(Number(itemNo) + 1));
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create BOQ item");
    } finally {
      setSaving(false);
    }
  }

  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Bill of Quantities</h2>
          <p className="muted">Enter quantity takeoff items for the selected project.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 9,
              border: "1px solid #d1d5db",
              font: "inherit",
              minWidth: 220,
            }}
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            className="primary"
            disabled={!selectedProjectId}
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus size={16} />
            {showForm ? "Cancel" : "Add item"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <section className="panel form">
          <h3>New BOQ item</h3>
          <div className="formGrid">
            <label>
              Item no
              <input
                type="number"
                min={1}
                value={itemNo}
                onChange={(e) => setItemNo(e.target.value)}
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
                placeholder="e.g. Reinforced concrete C25 for foundations"
              />
            </label>
            <label className="wide">
              Rate analysis (optional)
              <select
                value={rateAnalysisId}
                onChange={(e) => onSelectAnalysis(e.target.value)}
                style={{
                  padding: "11px 12px",
                  borderRadius: 9,
                  border: "1px solid #d1d5db",
                  font: "inherit",
                  fontWeight: 400,
                }}
              >
                <option value="">Manual unit rate</option>
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.description} ({fmt(Number(a.direct_cost))} / {a.unit})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                step="0.01"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label>
              Unit rate (ETB)
              <input
                type="number"
                step="0.01"
                min={0}
                value={unitRate}
                onChange={(e) => setUnitRate(e.target.value)}
                disabled={!!rateAnalysisId}
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
              onClick={() => void handleCreateItem()}
              disabled={saving || !description.trim() || !selectedProjectId}
            >
              {saving ? "Saving..." : "Add item"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>BOQ items</h3>
          <span className="muted">
            {items.length} item{items.length === 1 ? "" : "s"} · Total: {fmt(total)}
          </span>
        </div>

        {loading ? (
          <div className="emptySmall">Loading BOQ...</div>
        ) : items.length === 0 ? (
          <div className="emptySmall">
            <ClipboardList size={28} />
            <strong>No BOQ items yet</strong>
            <span>Add the first quantity takeoff item for this project.</span>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_no}</td>
                    <td>
                      {item.description}
                      {item.rate_analysis_id && (
                        <div className="muted" style={{ fontSize: 12 }}>from rate analysis</div>
                      )}
                    </td>
                    <td>{item.unit}</td>
                    <td>{Number(item.quantity).toLocaleString()}</td>
                    <td>{fmt(Number(item.unit_rate))}</td>
                    <td>
                      <strong>{fmt(Number(item.amount))}</strong>
                    </td>
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
