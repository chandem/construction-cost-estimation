import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { getProjectSummary, type ProjectSummary } from "../../api/summary";
import ProjectSelect from "../../components/ProjectSelect";
import { useApp } from "../../context/AppContext";
import { fmtMoney, fmtNum } from "../../lib/format";

export default function SummaryPage() {
  const { selectedProjectId, selectedProject } = useApp();
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [overhead, setOverhead] = useState("10");
  const [profit, setProfit] = useState("5");
  const [contingency, setContingency] = useState("3");

  useEffect(() => {
    if (!selectedProjectId) {
      setSummary(null);
      return;
    }
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, overhead, profit, contingency]);

  async function loadSummary() {
    if (!selectedProjectId) return;
    setLoading(true);
    setError("");
    try {
      const next = await getProjectSummary(selectedProjectId, {
        overhead_percent: Number(overhead) || 0,
        profit_percent: Number(profit) || 0,
        contingency_percent: Number(contingency) || 0,
      });
      setSummary(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  const currency = selectedProject?.currency || "ETB";

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Cost summary</h2>
          <p className="muted">Live direct cost plus adjustable markups for the active project.</p>
        </div>
        <ProjectSelect />
      </div>

      {error && <div className="error">{error}</div>}

      <section className="panel form">
        <h3>Markups (%)</h3>
        <div className="formGrid">
          <label>
            Overhead
            <input type="number" min={0} step="0.1" value={overhead} onChange={(e) => setOverhead(e.target.value)} />
          </label>
          <label>
            Profit
            <input type="number" min={0} step="0.1" value={profit} onChange={(e) => setProfit(e.target.value)} />
          </label>
          <label>
            Contingency
            <input
              type="number"
              min={0}
              step="0.1"
              value={contingency}
              onChange={(e) => setContingency(e.target.value)}
            />
          </label>
        </div>
      </section>

      {!selectedProjectId ? (
        <div className="emptySmall">
          <BarChart3 size={28} />
          <strong>No project selected</strong>
        </div>
      ) : loading ? (
        <div className="emptySmall">Loading summary…</div>
      ) : summary ? (
        <>
          <div className="cards">
            <div className="card">
              <div>
                <span>Direct cost</span>
                <strong>{fmtNum(summary.direct_cost)}</strong>
              </div>
            </div>
            <div className="card">
              <div>
                <span>Overhead</span>
                <strong>{fmtNum(summary.overhead)}</strong>
              </div>
            </div>
            <div className="card">
              <div>
                <span>Profit</span>
                <strong>{fmtNum(summary.profit)}</strong>
              </div>
            </div>
            <div className="card">
              <div>
                <span>Contingency</span>
                <strong>{fmtNum(summary.contingency)}</strong>
              </div>
            </div>
          </div>

          <section className="panel">
            <h3>Grand total</h3>
            <p style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 0", letterSpacing: "-0.03em" }}>
              {fmtMoney(summary.grand_total, currency)}
            </p>
            <p className="muted">{summary.item_count} BOQ items included</p>
          </section>

          <section className="panel tablePanel">
            <div className="tableHead">
              <h3>By section</h3>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th className="num">Items</th>
                    <th className="num">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.sections.length === 0 ? (
                    <tr>
                      <td colSpan={3}>No sections yet — items may be unsectioned.</td>
                    </tr>
                  ) : (
                    summary.sections.map((section) => (
                      <tr key={section.section_id ?? section.section_name}>
                        <td>{section.section_name}</td>
                        <td className="num">{section.item_count}</td>
                        <td className="num money">{fmtNum(section.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
