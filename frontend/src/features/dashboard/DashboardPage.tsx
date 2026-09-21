import { FolderKanban, ClipboardList, CircleDollarSign, BarChart3 } from "lucide-react";

type DashboardPageProps = {
  projectsCount: number;
};

export default function DashboardPage({ projectsCount }: DashboardPageProps) {
  return (
    <div className="stack">
      <section className="hero">
        <div>
          <div className="eyebrow">CONSTRUCTION COST ESTIMATION</div>
          <h2>Build accurate BOQs and unit-rate estimates for Ethiopian projects</h2>
          <p className="muted">
            Create projects, enter quantities, apply material/labor rates or rate analyses,
            then generate versioned cost summaries with overhead, profit and contingency.
          </p>
        </div>
        <button type="button" className="primary">
          New project
        </button>
      </section>

      <div className="cards">
        <div className="card">
          <div className="cardIcon">
            <FolderKanban size={19} />
          </div>
          <div>
            <span>Projects</span>
            <strong>{projectsCount}</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <ClipboardList size={19} />
          </div>
          <div>
            <span>BOQ items</span>
            <strong>—</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <CircleDollarSign size={19} />
          </div>
          <div>
            <span>Cost rates</span>
            <strong>—</strong>
          </div>
        </div>
        <div className="card">
          <div className="cardIcon">
            <BarChart3 size={19} />
          </div>
          <div>
            <span>Estimate versions</span>
            <strong>—</strong>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <h3>Quick workflow</h3>
          <ol>
            <li>Create a project (location, client, currency)</li>
            <li>Add cost categories and unit rates</li>
            <li>Build rate analyses with waste factors</li>
            <li>Enter BOQ sections and quantities</li>
            <li>Generate estimate versions with markups</li>
          </ol>
        </section>
        <section className="panel">
          <h3>Next steps</h3>
          <div className="actions">
            <button type="button">Manage projects</button>
            <button type="button">Enter BOQ items</button>
            <button type="button">Add cost rates</button>
            <button type="button">View summary</button>
          </div>
        </section>
      </div>
    </div>
  );
}
