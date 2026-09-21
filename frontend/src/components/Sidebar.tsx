import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  CircleDollarSign,
  Layers,
  History,
  BarChart3,
} from "lucide-react";

type SidebarProps = {
  active: string;
  onNavigate: (tab: string) => void;
};

const tabs = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "Projects", label: "Projects", icon: FolderKanban },
  { id: "BOQ", label: "Bill of Quantities", icon: ClipboardList },
  { id: "Rates", label: "Cost Rates", icon: CircleDollarSign },
  { id: "RateAnalysis", label: "Rate Analysis", icon: Layers },
  { id: "Versions", label: "Estimate Versions", icon: History },
  { id: "Summary", label: "Summary", icon: BarChart3 },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">CE</div>
        <div>
          <strong>Cost Estimator</strong>
          <span>Construction</span>
        </div>
      </div>

      <nav>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav ${id === active ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sideBottom">v0.8 · Ethiopia</div>
    </aside>
  );
}
