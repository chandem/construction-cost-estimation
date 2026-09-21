import { useEffect, useState } from "react";
import DashboardPage from "./features/dashboard/DashboardPage";
import ProjectsPage from "./features/projects/ProjectsPage";
import BoqPage from "./features/boq/BoqPage";
import RatesPage from "./features/rates/RatesPage";
import RateAnalysisPage from "./features/rateAnalysis/RateAnalysisPage";
import VersionsPage from "./features/versions/VersionsPage";
import SummaryPage from "./features/summary/SummaryPage";
import Sidebar from "./components/Sidebar";
import ErrorBanner from "./components/ErrorBanner";
import LoadingSpinner from "./components/LoadingSpinner";
import { listProjects, type Project } from "./api/projects";

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  Dashboard: { title: "Overview", eyebrow: "DASHBOARD" },
  Projects: { title: "Projects", eyebrow: "PROJECT MANAGEMENT" },
  BOQ: { title: "Bill of Quantities", eyebrow: "QUANTITY TAKEOFF" },
  Rates: { title: "Cost Rates", eyebrow: "UNIT RATES" },
  RateAnalysis: { title: "Rate Analysis", eyebrow: "COMPOSITE RATES" },
  Versions: { title: "Estimate Versions", eyebrow: "REVISION HISTORY" },
  Summary: { title: "Cost Summary", eyebrow: "ESTIMATE TOTALS" },
};

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

    void loadProjects();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const meta = pageTitles[activeTab] ?? { title: activeTab, eyebrow: "" };

  return (
    <div className="app">
      <Sidebar active={activeTab} onNavigate={setActiveTab} />
      <main>
        <header>
          <div>
            <div className="eyebrow">{meta.eyebrow}</div>
            <h1>{meta.title}</h1>
          </div>
          <div className="headerRight">
            <span className="statusDot" />
            API connected · {projects.length} project{projects.length === 1 ? "" : "s"}
          </div>
        </header>

        <div className="content">
          {activeTab === "Dashboard" && (
            <DashboardPage projectsCount={projects.length} />
          )}
          {activeTab === "Projects" && (
            <ProjectsPage projects={projects} onProjectsChange={setProjects} />
          )}
          {activeTab === "BOQ" && <BoqPage projects={projects} />}
          {activeTab === "Rates" && <RatesPage projectsCount={projects.length} />}
          {activeTab === "RateAnalysis" && <RateAnalysisPage />}
          {activeTab === "Versions" && <VersionsPage projects={projects} />}
          {activeTab === "Summary" && <SummaryPage projects={projects} />}
        </div>
      </main>
    </div>
  );
}
