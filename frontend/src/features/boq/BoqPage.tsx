import { useEffect, useMemo, useState } from "react";
import { Plus, ClipboardList, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import {
  createBOQ,
  createSection,
  deleteBOQItem,
  listBOQ,
  listSections,
  type BOQItem,
  type BOQSection,
} from "../../api/boq";
import { listRateAnalyses, type RateAnalysis } from "../../api/rateAnalysis";
import { downloadBoqExcel, downloadBoqPdf } from "../../api/exports";
import ProjectSelect from "../../components/ProjectSelect";
import { useApp } from "../../context/AppContext";
import { fmtMoney, fmtNum } from "../../lib/format";

export default function BoqPage() {
  const { selectedProjectId, selectedProject, pushToast } = useApp();
  const [items, setItems] = useState<BOQItem[]>([]);
  const [sections, setSections] = useState<BOQSection[]>([]);
  const [analyses, setAnalyses] = useState<RateAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string>("all");

  const [itemNo, setItemNo] = useState("1");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("m³");
  const [quantity, setQuantity] = useState("1");
  const [unitRate, setUnitRate] = useState("0");
  const [rateAnalysisId, setRateAnalysisId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState("");

  useEffect(() => {
    void listRateAnalyses().then(setAnalyses).catch(() => setAnalyses([]));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setItems([]);
      setSections([]);
      return;
    }
    void loadAll(selectedProjectId);
  }, [selectedProjectId]);

  async function loadAll(projectId: string) {
    setLoading(true);
    setError("");
    try {
      const [itemRows, sectionRows] = await Promise.all([
        listBOQ(projectId),
        listSections(projectId),
      ]);
      setItems(itemRows);
      setSections(sectionRows);
      if (itemRows.length > 0) {
        setItemNo(String(Math.max(...itemRows.map((r) => r.item_no)) + 1));
      } else {
        setItemNo("1");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load BOQ");
      setItems([]);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }

  function onSelectAnalysis(id: string) {
    setRateAnalysisId(id);
    if (!id) return;
    const analysis = analyses.find((a) => a.id === id);
    if (!analysis) return;
    setUnit(analysis.unit);
    setUnitRate(String(analysis.direct_cost));
    if (!description.trim()) setDescription(analysis.description);
  }

  async function handleCreateSection() {
    if (!selectedProjectId || !sectionName.trim()) return;
    setSaving(true);
    try {
      const created = await createSection(selectedProjectId, {
        name: sectionName.trim(),
        sort_order: sections.length,
      });
      setSections((prev) => [...prev, created]);
      setSectionId(created.id);
      setSectionName("");
      setShowSectionForm(false);
      pushToast("success", "Section created");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create section");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateItem() {
    if (!selectedProjectId || !description.trim()) return;
    setSaving(true);
    try {
      const payload: Partial<BOQItem> = {
        item_no: Number(itemNo),
        description: description.trim(),
        unit,
        quantity: Number(quantity),
        unit_rate: Number(unitRate),
      };
      if (rateAnalysisId) payload.rate_analysis_id = rateAnalysisId;
      if (sectionId) payload.section_id = sectionId;
      const created = await createBOQ(selectedProjectId, payload);
      setItems((current) => [...current, created].sort((a, b) => a.item_no - b.item_no));
      setDescription("");
      setQuantity("1");
      setUnitRate("0");
      setRateAnalysisId("");
      setItemNo(String(Number(itemNo) + 1));
      setShowForm(false);
      pushToast("success", "BOQ item added");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create BOQ item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!selectedProjectId) return;
    try {
      await deleteBOQItem(selectedProjectId, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      pushToast("success", "Item deleted");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleExport(kind: "xlsx" | "pdf") {
    if (!selectedProjectId) return;
    try {
      if (kind === "xlsx") {
        await downloadBoqExcel(selectedProjectId, selectedProject?.name);
      } else {
        await downloadBoqPdf(selectedProjectId, selectedProject?.name);
      }
      pushToast("success", kind === "xlsx" ? "Excel downloaded" : "PDF downloaded");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Export failed");
    }
  }

  const sectionNameById = useMemo(() => {
    const map: Record<string, string> = {};
    sections.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sections]);

  const visibleItems = items.filter((item) => {
    if (sectionFilter === "all") return true;
    if (sectionFilter === "none") return !item.section_id;
    return item.section_id === sectionFilter;
  });

  const total = visibleItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const currency = selectedProject?.currency || "ETB";

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Bill of Quantities</h2>
          <p className="muted">Quantity takeoff with sections, rate analyses, and exports.</p>
        </div>
        <div className="toolbar">
          <ProjectSelect />
          <button
            type="button"
            className="secondary"
            disabled={!selectedProjectId || items.length === 0}
            onClick={() => void handleExport("xlsx")}
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!selectedProjectId || items.length === 0}
            onClick={() => void handleExport("pdf")}
          >
            <FileText size={16} /> PDF
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!selectedProjectId}
            onClick={() => setShowSectionForm((v) => !v)}
          >
            Section
          </button>
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

      {sections.length > 0 && (
        <div className="sectionChips">
          <button
            type="button"
            className={`chip ${sectionFilter === "all" ? "active" : ""}`}
            onClick={() => setSectionFilter("all")}
          >
            All
          </button>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${sectionFilter === s.id ? "active" : ""}`}
              onClick={() => setSectionFilter(s.id)}
            >
              {s.name}
            </button>
          ))}
          <button
            type="button"
            className={`chip ${sectionFilter === "none" ? "active" : ""}`}
            onClick={() => setSectionFilter("none")}
          >
            Unassigned
          </button>
        </div>
      )}

      {showSectionForm && (
        <section className="panel form">
          <h3>New section</h3>
          <div className="formGrid">
            <label className="wide">
              Section name *
              <input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g. Substructure"
              />
            </label>
          </div>
          <div className="formActions">
            <button type="button" className="secondary" onClick={() => setShowSectionForm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              disabled={saving || !sectionName.trim()}
              onClick={() => void handleCreateSection()}
            >
              Create section
            </button>
          </div>
        </section>
      )}

      {showForm && (
        <section className="panel form">
          <h3>New BOQ item</h3>
          <div className="formGrid">
            <label>
              Item no
              <input type="number" min={1} value={itemNo} onChange={(e) => setItemNo(e.target.value)} />
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
            <label>
              Section
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                <option value="">Unassigned</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rate analysis
              <select value={rateAnalysisId} onChange={(e) => onSelectAnalysis(e.target.value)}>
                <option value="">Manual unit rate</option>
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {fmtNum(a.direct_cost)} / {a.unit}
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
              Unit rate ({currency})
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
              disabled={saving || !description.trim()}
              onClick={() => void handleCreateItem()}
            >
              {saving ? "Saving…" : "Add item"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>BOQ items</h3>
          <span className="muted">
            {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"} · {fmtMoney(total, currency)}
          </span>
        </div>

        {!selectedProjectId ? (
          <div className="emptySmall">Select or create a project first.</div>
        ) : loading ? (
          <div className="emptySmall">Loading BOQ…</div>
        ) : visibleItems.length === 0 ? (
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
                  <th>Section</th>
                  <th>Unit</th>
                  <th className="num">Qty</th>
                  <th className="num">Rate</th>
                  <th className="num">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_no}</td>
                    <td>
                      {item.description}
                      {item.rate_analysis_id && (
                        <div>
                          <span className="badge blue">rate analysis</span>
                        </div>
                      )}
                    </td>
                    <td>{item.section_id ? sectionNameById[item.section_id] || "—" : "—"}</td>
                    <td>{item.unit}</td>
                    <td className="num">{fmtNum(item.quantity)}</td>
                    <td className="num">{fmtNum(item.unit_rate)}</td>
                    <td className="num money">{fmtNum(item.amount)}</td>
                    <td>
                      <button
                        type="button"
                        className="dangerBtn"
                        title="Delete"
                        onClick={() => void handleDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
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
