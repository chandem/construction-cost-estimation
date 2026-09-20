type DashboardPageProps = {
  projectsCount: number;
};

export default function DashboardPage({ projectsCount }: DashboardPageProps) {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Projects</span>
          <strong>{projectsCount}</strong>
        </div>
      </div>
    </div>
  );
}
