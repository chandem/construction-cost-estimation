import { useApp } from "../context/AppContext";

type Props = {
  className?: string;
};

export default function ProjectSelect({ className }: Props) {
  const { projects, selectedProjectId, setSelectedProjectId } = useApp();

  return (
    <select
      className={className || "select"}
      value={selectedProjectId}
      onChange={(e) => setSelectedProjectId(e.target.value)}
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
  );
}
