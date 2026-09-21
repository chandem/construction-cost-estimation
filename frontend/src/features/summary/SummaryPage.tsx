import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { getProjectSummary, type ProjectSummary } from "../../api/summary";
import { type Project } from "../../api/projects";

type SummaryPageProps = {
  projects: Project[];
};

export default function SummaryPage({ projects }: SummaryPageProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [overhead, setOverhead] = useState("10");
  const [profit, setProfit] = useState("5");
  const [contingency, setContingency] = useState("3");

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setSummary(null);
      return;
    }
    void loadSummary();
  }, [selectedProjectId, overhead, profit, contingency]);

  async function loadSummary() {
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

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Cost Summary</h2>
          <p className="muted">
            Direct cost plus overhead, profit and contingency for the selected project.
          </p>
        </div>
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
      </div>

      {error && <div className="error">{error}</div>}

      <section className="panel form">
        <h3>Markups (%)</h3>
        <div className="formGrid">
          <label>
            Overhead
            <input
              type="number"
              min={0}
              step="0.1"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
            />
          </label>
          <label>
            Profit
            <input
              type="number"
              min={0}
              step="0.1"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
            />
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
        <div className="emptySmall">Loading summary...</div>
      ) : summary ? (
        <>
          <div className="cards">
            <div className="card">
              <div>
                <span>Direct cost</span>
                <strong>{fmt(summary.direct_cost)}</strong>
              </div>
            </div>
            <div className="card">
              <div>
                <span>Overhead</span>
                <strong>{fmt(summary.overhead)}</strong>
              </div>
            </div>
            <div className="card">
              <div>
                <span>Profit</span>
                <strong>{fmt(summary.profit)}</strong>
              </div>
            </div>
            <div className="card">
              <div>
                <span>Contingency</span>
                <strong>{fmt(summary.contingency)}</strong>
              </div>
            </div>
          </div>

          <section className="panel">
            <h3>Grand total</h3>
            <p style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 0" }}>
              {fmt(summary.grand_total)} ETB
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
                    <th>Items</th>
                    <th>Subtotal</th>
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
                        <td>{section.item_count}</td>
                        <td>{fmt(section.subtotal)}</td>
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
