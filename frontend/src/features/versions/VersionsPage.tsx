import { useEffect, useState } from "react";
import { Plus, History } from "lucide-react";
import {
  createEstimateVersion,
  listEstimateVersions,
  type EstimateVersion,
} from "../../api/estimateVersions";
import { type Project } from "../../api/projects";

type VersionsPageProps = {
  projects: Project[];
};

export default function VersionsPage({ projects }: VersionsPageProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [versions, setVersions] = useState<EstimateVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<EstimateVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [overhead, setOverhead] = useState("10");
  const [profit, setProfit] = useState("5");
  const [contingency, setContingency] = useState("3");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setVersions([]);
      setSelectedVersion(null);
      return;
    }
    void loadVersions(selectedProjectId);
  }, [selectedProjectId]);

  async function loadVersions(projectId: string) {
    setLoading(true);
    setError("");
    try {
      const rows = await listEstimateVersions(projectId);
      setVersions(rows);
      setSelectedVersion(rows[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load versions");
      setVersions([]);
      setSelectedVersion(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!selectedProjectId || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await createEstimateVersion(selectedProjectId, {
        name: name.trim(),
        overhead_percent: Number(overhead) || 0,
        profit_percent: Number(profit) || 0,
        contingency_percent: Number(contingency) || 0,
        notes: notes.trim() || null,
      });
      setVersions((prev) => [created, ...prev]);
      setSelectedVersion(created);
      setName("");
      setNotes("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create version");
    } finally {
      setSaving(false);
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Estimate Versions</h2>
          <p className="muted">
            Snapshot the current BOQ with overhead, profit and contingency. Versions are frozen in time.
          </p>
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
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
            {showForm ? "Cancel" : "New version"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <section className="panel form">
          <h3>Create estimate version</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Copies all current BOQ items into a frozen snapshot.
          </p>
          <div className="formGrid">
            <label className="wide">
              Version name *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tender submission v1"
              />
            </label>
            <label>
              Overhead %
              <input
                type="number"
                min={0}
                step="0.1"
                value={overhead}
                onChange={(e) => setOverhead(e.target.value)}
              />
            </label>
            <label>
              Profit %
              <input
                type="number"
                min={0}
                step="0.1"
                value={profit}
                onChange={(e) => setProfit(e.target.value)}
              />
            </label>
            <label>
              Contingency %
              <input
                type="number"
                min={0}
                step="0.1"
                value={contingency}
                onChange={(e) => setContingency(e.target.value)}
              />
            </label>
            <label className="wide">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for this revision"
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
              onClick={() => void handleCreate()}
              disabled={saving || !name.trim()}
            >
              {saving ? "Creating..." : "Create version"}
            </button>
          </div>
        </section>
      )}

      <div className="grid">
        <section className="panel tablePanel">
          <div className="tableHead">
            <h3>Versions</h3>
            <span className="muted">{versions.length}</span>
          </div>
          {loading ? (
            <div className="emptySmall">Loading...</div>
          ) : versions.length === 0 ? (
            <div className="emptySmall">
              <History size={28} />
              <strong>No versions yet</strong>
              <span>Create a version after entering BOQ items.</span>
            </div>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      style={{
                        cursor: "pointer",
                        background:
                          selectedVersion?.id === v.id ? "#f1f5f9" : undefined,
                      }}
                    >
                      <td>v{v.version_no}</td>
                      <td>
                        <strong>{v.name}</strong>
                      </td>
                      <td>{fmt(Number(v.grand_total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          {!selectedVersion ? (
            <div className="emptySmall">
              <strong>Select a version</strong>
              <span>Details appear here.</span>
            </div>
          ) : (
            <>
              <h3>
                v{selectedVersion.version_no} — {selectedVersion.name}
              </h3>
              {selectedVersion.notes && (
                <p className="muted">{selectedVersion.notes}</p>
              )}
              <div className="cards" style={{ gridTemplateColumns: "1fr 1fr", margin: "16px 0" }}>
                <div className="card">
                  <div>
                    <span>Direct cost</span>
                    <strong>{fmt(Number(selectedVersion.direct_cost))}</strong>
                  </div>
                </div>
                <div className="card">
                  <div>
                    <span>Overhead ({selectedVersion.overhead_percent}%)</span>
                    <strong>{fmt(Number(selectedVersion.overhead))}</strong>
                  </div>
                </div>
                <div className="card">
                  <div>
                    <span>Profit ({selectedVersion.profit_percent}%)</span>
                    <strong>{fmt(Number(selectedVersion.profit))}</strong>
                  </div>
                </div>
                <div className="card">
                  <div>
                    <span>Contingency ({selectedVersion.contingency_percent}%)</span>
                    <strong>{fmt(Number(selectedVersion.contingency))}</strong>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 16px" }}>
                {fmt(Number(selectedVersion.grand_total))} ETB
              </p>
              <p className="muted">{selectedVersion.items.length} frozen items</p>

              {selectedVersion.items.length > 0 && (
                <div className="tableWrap" style={{ marginTop: 16 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVersion.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.item_no}</td>
                          <td>
                            {item.description}
                            {item.section_name && (
                              <div className="muted" style={{ fontSize: 12 }}>
                                {item.section_name}
                              </div>
                            )}
                          </td>
                          <td>{fmt(Number(item.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
