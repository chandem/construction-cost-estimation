import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { createProject } from "../../api/projects";
import { useApp } from "../../context/AppContext";

export default function ProjectsPage() {
  const { projects, setProjects, setSelectedProjectId, pushToast } = useApp();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("ETB");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await createProject({
        name: name.trim(),
        location: location.trim() || null,
        client_name: clientName.trim() || null,
        description: description.trim() || null,
        currency,
      });
      setProjects([...projects, created]);
      setSelectedProjectId(created.id);
      setName("");
      setLocation("");
      setClientName("");
      setDescription("");
      setCurrency("ETB");
      setShowForm(false);
      pushToast("success", `Project “${created.name}” created`);
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Projects</h2>
          <p className="muted">Manage construction projects and switch the active estimate context.</p>
        </div>
        <button type="button" className="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} />
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>

      {showForm && (
        <section className="panel form">
          <h3>Create project</h3>
          <div className="formGrid">
            <label>
              Project name *
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bole Residential Building" />
            </label>
            <label>
              Location
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Addis Ababa" />
            </label>
            <label>
              Client
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </label>
            <label>
              Currency
              <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
            </label>
            <label className="wide">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
          </div>
          <div className="formActions">
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              disabled={saving || !name.trim()}
              onClick={() => void handleCreate()}
            >
              {saving ? "Creating…" : "Create project"}
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
                  <th></th>
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
                    <td>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          pushToast("info", `Active project: ${project.name}`);
                        }}
                      >
                        Set active
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
