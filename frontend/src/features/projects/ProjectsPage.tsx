import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { createProject, type Project } from "../../api/projects";

type ProjectsPageProps = {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
};

export default function ProjectsPage({
  projects,
  onProjectsChange,
}: ProjectsPageProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("ETB");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await createProject({
        name: name.trim(),
        location: location.trim() || null,
        client_name: clientName.trim() || null,
        description: description.trim() || null,
        currency,
      });
      onProjectsChange([...projects, created]);
      setName("");
      setLocation("");
      setClientName("");
      setDescription("");
      setCurrency("ETB");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Projects</h2>
          <p className="muted">Manage construction projects and their estimates.</p>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <section className="panel form">
          <h3>Create project</h3>
          <div className="formGrid">
            <label>
              Project name *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bole Residential Building"
              />
            </label>
            <label>
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Addis Ababa"
              />
            </label>
            <label>
              Client
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
              />
            </label>
            <label>
              Currency
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </label>
            <label className="wide">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short project description"
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
              {saving ? "Creating..." : "Create project"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>All projects</h3>
          <span className="muted">{projects.length} total</span>
        </div>
        {projects.length === 0 ? (
          <div className="emptySmall">
            <FolderKanban size={28} />
            <strong>No projects yet</strong>
            <span>Create your first project to start estimating.</span>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Client</th>
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.name}</strong>
                    </td>
                    <td>{project.location || "—"}</td>
                    <td>{project.client_name || "—"}</td>
                    <td>{project.currency}</td>
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
