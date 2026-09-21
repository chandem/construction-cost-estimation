import {
  FolderKanban,
  ClipboardList,
  CircleDollarSign,
  History,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

type Props = {
  onNavigate: (tab: string) => void;
};

export default function DashboardPage({ onNavigate }: Props) {
  const { projects, selectedProject } = useApp();

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <div className="eyebrow" style={{ color: "#93c5fd" }}>CONSTRUCTION COST ESTIMATION</div>
          <h2>Professional BOQ and rate analysis for Ethiopian projects</h2>
          <p className="muted">
            Create projects, build unit rates and rate analyses, enter quantities,
            then publish versioned estimates with overhead, profit and contingency.
          </p>
        </div>
        <button type="button" className="primary" onClick={() => onNavigate("Projects")}>
          Manage projects <ArrowRight size={16} />
        </button>
      </section>

      <div className="cards">
        <div className="card">
          <div className="cardIcon">
            <FolderKanban size={18} />
          </div>
          <div>
            <span>Projects</span>
            <strong>{projects.length}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <ClipboardList size={18} />
          </div>
          <div>
            <span>Active project</span>
            <strong style={{ fontSize: 15 }}>{selectedProject?.name || "None"}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <CircleDollarSign size={18} />
          </div>
          <div>
            <span>Currency</span>
            <strong>{selectedProject?.currency || "ETB"}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <History size={18} />
          </div>
          <div>
            <span>Workflow</span>
            <strong style={{ fontSize: 15 }}>Rates → BOQ → Version</strong>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <h3>Recommended workflow</h3>
          <ol>
            <li>Create a project with location and client</li>
            <li>Add cost categories (Material, Labor, Equipment)</li>
            <li>Enter unit rates, then build rate analyses with waste</li>
            <li>Enter BOQ items (optionally linked to rate analyses)</li>
            <li>Create an estimate version for tender submission</li>
            <li>Export BOQ to Excel or PDF</li>
          </ol>
        </section>
        <section className="panel">
          <h3>Quick actions</h3>
          <div className="actions">
            <button type="button" onClick={() => onNavigate("Projects")}>
              Projects
            </button>
            <button type="button" onClick={() => onNavigate("Categories")}>
              Categories
            </button>
            <button type="button" onClick={() => onNavigate("Rates")}>
              Cost rates
            </button>
            <button type="button" onClick={() => onNavigate("RateAnalysis")}>
              Rate analysis
            </button>
            <button type="button" onClick={() => onNavigate("BOQ")}>
              Bill of quantities
            </button>
            <button type="button" onClick={() => onNavigate("Versions")}>
              Estimate versions
            </button>
            <button type="button" onClick={() => onNavigate("Summary")}>
              Summary
            </button>
            <button type="button" onClick={() => onNavigate("BOQ")}>
              Export BOQ
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
