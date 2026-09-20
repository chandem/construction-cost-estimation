import { useState } from "react";
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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    setError("");
    try {
      const created = await createProject({
        name,
        currency: "ETB",
      });
      onProjectsChange([...projects, created]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h2>Projects</h2>
      {error && <div className="error-banner">{error}</div>}

      <div className="create-project">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
        />
        <button onClick={handleCreate} disabled={saving || !name}>
          {saving ? "Creating..." : "Create project"}
        </button>
      </div>

      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
