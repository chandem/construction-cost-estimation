import { useEffect, useState } from "react";
import DashboardPage from "./features/dashboard/DashboardPage";
import ProjectsPage from "./features/projects/ProjectsPage";
import Sidebar from "./components/Sidebar";
import ErrorBanner from "./components/ErrorBanner";
import LoadingSpinner from "./components/LoadingSpinner";
import { listProjects, type Project } from "./api/projects";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const rows = await listProjects();
        setProjects(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="app-shell">
      <Sidebar active={activeTab} onNavigate={setActiveTab} />
      <main className="content">
        {activeTab === "Dashboard" && <DashboardPage projectsCount={projects.length} />}
        {activeTab === "Projects" && (
          <ProjectsPage projects={projects} onProjectsChange={setProjects} />
        )}
      </main>
    </div>
  );
}
