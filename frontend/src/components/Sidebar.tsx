type SidebarProps = {
  active: string;
  onNavigate: (tab: string) => void;
};

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const tabs = ["Dashboard", "Projects", "BOQ", "Rates", "Summary"];

  return (
    <aside className="sidebar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={tab === active ? "active" : ""}
          onClick={() => onNavigate(tab)}
        >
          {tab}
        </button>
      ))}
    </aside>
  );
}
