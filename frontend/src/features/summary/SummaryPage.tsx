import { useEffect, useState } from "react";
import { getProjectSummary, type ProjectSummary } from "../../api/summary";
import { type Project } from "../../api/projects";

type SummaryPageProps = {
  projects: Project[];
};

export default function SummaryPage({ projects }: SummaryPageProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? "");
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const overhead = 10;
  const profit = 5;
  const contingency = 3;

  useEffect(() => {
    if (!selectedProjectId) {
      setSummary(null);
      return;
    }

    async function loadSummary() {
      setLoading(true);
      setError("");
      try {
        const next = await getProjectSummary(selectedProjectId, {
          overhead_percent: overhead,
          profit_percent: profit,
          contingency_percent: contingency,
        });
        setSummary(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summary");
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();
  }, [selectedProjectId]);

  return (
    <div className="page">
      <h2>Project Summary</h2>
      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
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

      {!selectedProjectId ? (
        <div>No project selected.</div>
      ) : loading ? (
        <div>Loading summary...</div>
      ) : summary ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Direct cost</span>
              <strong>{summary.direct_cost}</strong>
            </div>
            <div className="stat-card">
              <span>Overhead</span>
              <strong>{summary.overhead}</strong>
            </div>
            <div className="stat-card">
              <span>Profit</span>
              <strong>{summary.profit}</strong>
            </div>
            <div className="stat-card">
              <span>Contingency</span>
              <strong>{summary.contingency}</strong>
            </div>
            <div className="stat-card">
              <span>Grand total</span>
              <strong>{summary.grand_total}</strong>
            </div>
          </div>

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
                  <td colSpan={3}>No sections yet.</td>
                </tr>
              ) : (
                summary.sections.map((section) => (
                  <tr key={section.section_id ?? section.section_name}>
                    <td>{section.section_name}</td>
                    <td>{section.item_count}</td>
                    <td>{section.subtotal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
