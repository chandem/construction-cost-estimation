import { useEffect, useState } from "react";
import {
  FolderKanban,
  ClipboardList,
  CircleDollarSign,
  History,
  ArrowRight,
  Layers,
  Database,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  getDashboardStats,
  seedEthiopiaDefaults,
  type DashboardStats,
} from "../../api/dashboard";
import { fmtMoney, fmtNum } from "../../lib/format";

type Props = {
  onNavigate: (tab: string) => void;
};

export default function DashboardPage({ onNavigate }: Props) {
  const { projects, selectedProject, pushToast } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [seeding, setSeeding] = useState(false);

  async function loadStats() {
    try {
      setStats(await getDashboardStats());
    } catch {
      setStats(null);
    }
  }

  useEffect(() => {
    void loadStats();
  }, [projects.length]);

  async function handleSeed() {
    setSeeding(true);
    try {
      const result = await seedEthiopiaDefaults();
      pushToast(
        "success",
        `Seeded ${result.categories_created} categories, ${result.rates_created} rates`,
      );
      await loadStats();
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <div className="eyebrow" style={{ color: "#93c5fd" }}>
            CONSTRUCTION COST ESTIMATION
          </div>
          <h2>Professional BOQ and rate analysis for Ethiopian projects</h2>
          <p className="muted">
            Create projects, build unit rates and rate analyses, enter quantities, then publish
            versioned estimates with overhead, profit and contingency.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" className="primary" onClick={() => onNavigate("Projects")}>
            Manage projects <ArrowRight size={16} />
          </button>
          <button type="button" className="secondary" disabled={seeding} onClick={() => void handleSeed()}>
            <Database size={16} />
            {seeding ? "Seeding…" : "Seed Ethiopia sample rates"}
          </button>
        </div>
      </section>

      <div className="cards">
        <div className="card">
          <div className="cardIcon">
            <FolderKanban size={18} />
          </div>
          <div>
            <span>Projects</span>
            <strong>{stats?.projects ?? projects.length}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <CircleDollarSign size={18} />
          </div>
          <div>
            <span>Cost rates</span>
            <strong>{stats?.cost_rates ?? "—"}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <Layers size={18} />
          </div>
          <div>
            <span>Rate analyses</span>
            <strong>{stats?.rate_analyses ?? "—"}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <ClipboardList size={18} />
          </div>
          <div>
            <span>BOQ items</span>
            <strong>{stats?.boq_items ?? "—"}</strong>
          </div>
        </div>
      </div>

      <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card">
          <div className="cardIcon">
            <History size={18} />
          </div>
          <div>
            <span>Estimate versions</span>
            <strong>{stats?.estimate_versions ?? "—"}</strong>
          </div>
        </div>
        <div className="card">
          <div>
            <span>Total direct cost (all projects)</span>
            <strong style={{ fontSize: 18 }}>
              {stats ? fmtMoney(stats.total_direct_cost, "ETB") : "—"}
            </strong>
          </div>
        </div>
        <div className="card">
          <div>
            <span>Active project</span>
            <strong style={{ fontSize: 15 }}>{selectedProject?.name || "None selected"}</strong>
            <span className="muted" style={{ marginTop: 4, display: "block" }}>
              {selectedProject?.currency || "ETB"}
              {selectedProject?.location ? ` · ${selectedProject.location}` : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <h3>Recommended workflow</h3>
          <ol>
            <li>Seed sample categories & rates (or enter your own)</li>
            <li>Create a project with location and client</li>
            <li>Build rate analyses with waste factors</li>
            <li>Enter BOQ items (link to rate analyses)</li>
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

      {stats && (
        <p className="muted" style={{ fontSize: 12 }}>
          Live totals from API · categories {fmtNum(stats.categories, 0)} · rates{" "}
          {fmtNum(stats.cost_rates, 0)}
        </p>
      )}
    </div>
  );
}
