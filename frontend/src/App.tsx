import { useState } from "react";
import { Menu } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import DashboardPage from "./features/dashboard/DashboardPage";
import ProjectsPage from "./features/projects/ProjectsPage";
import BoqPage from "./features/boq/BoqPage";
import RatesPage from "./features/rates/RatesPage";
import RateAnalysisPage from "./features/rateAnalysis/RateAnalysisPage";
import VersionsPage from "./features/versions/VersionsPage";
import SummaryPage from "./features/summary/SummaryPage";
import CategoriesPage from "./features/categories/CategoriesPage";
import Sidebar from "./components/Sidebar";
import ErrorBanner from "./components/ErrorBanner";
import LoadingSpinner from "./components/LoadingSpinner";
import ToastStack from "./components/ToastStack";

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  Dashboard: { title: "Overview", eyebrow: "DASHBOARD" },
  Projects: { title: "Projects", eyebrow: "PROJECT MANAGEMENT" },
  BOQ: { title: "Bill of Quantities", eyebrow: "QUANTITY TAKEOFF" },
  Categories: { title: "Cost Categories", eyebrow: "COST DATA" },
  Rates: { title: "Cost Rates", eyebrow: "UNIT RATES" },
  RateAnalysis: { title: "Rate Analysis", eyebrow: "COMPOSITE RATES" },
  Versions: { title: "Estimate Versions", eyebrow: "REVISION HISTORY" },
  Summary: { title: "Cost Summary", eyebrow: "ESTIMATE TOTALS" },
};

function AppShell() {
  const { projects, loading, bootError, refreshProjects, selectedProject } = useApp();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (bootError) {
    return (
      <ErrorBanner
        message={bootError}
        onRetry={() => {
          void refreshProjects().catch(() => undefined);
          window.location.reload();
        }}
      />
    );
  }

  const meta = pageTitles[activeTab] ?? { title: activeTab, eyebrow: "" };

  return (
    <div className="app">
      <Sidebar
        active={activeTab}
        onNavigate={setActiveTab}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main>
        <header className="appHeader">
          <button type="button" className="menuBtn" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
          <div>
            <div className="eyebrow">{meta.eyebrow}</div>
            <h1>{meta.title}</h1>
          </div>
          <div className="headerRight">
            {selectedProject && (
              <span className="badge blue">{selectedProject.name}</span>
            )}
            <span className="statusPill">
              <span className="statusDot" />
              Live · {projects.length} project{projects.length === 1 ? "" : "s"}
            </span>
          </div>
        </header>

        <div className="content">
          {activeTab === "Dashboard" && (
            <DashboardPage onNavigate={setActiveTab} />
          )}
          {activeTab === "Projects" && <ProjectsPage />}
          {activeTab === "BOQ" && <BoqPage />}
          {activeTab === "Categories" && <CategoriesPage />}
          {activeTab === "Rates" && <RatesPage />}
          {activeTab === "RateAnalysis" && <RateAnalysisPage />}
          {activeTab === "Versions" && <VersionsPage />}
          {activeTab === "Summary" && <SummaryPage />}
        </div>
      </main>
      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
