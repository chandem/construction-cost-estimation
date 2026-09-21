import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  CircleDollarSign,
  Layers,
  History,
  BarChart3,
  Tags,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

type SidebarProps = {
  active: string;
  onNavigate: (tab: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const groups = [
  {
    label: "Overview",
    items: [{ id: "Dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Estimating",
    items: [
      { id: "Projects", label: "Projects", icon: FolderKanban },
      { id: "BOQ", label: "Bill of Quantities", icon: ClipboardList },
      { id: "Versions", label: "Estimate Versions", icon: History },
      { id: "Summary", label: "Summary", icon: BarChart3 },
    ],
  },
  {
    label: "Cost data",
    items: [
      { id: "Categories", label: "Categories", icon: Tags },
      { id: "Rates", label: "Cost Rates", icon: CircleDollarSign },
      { id: "RateAnalysis", label: "Rate Analysis", icon: Layers },
    ],
  },
];

export default function Sidebar({
  active,
  onNavigate,
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && <div className="sidebarBackdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobileOpen" : ""}`}>
        <div className="brand">
          <div className="brandMark">CE</div>
          {!collapsed && (
            <div>
              <strong>Cost Estimator</strong>
              <span>Ethiopia · Construction</span>
            </div>
          )}
        </div>

        <nav className="sideNav">
          {groups.map((group) => (
            <div key={group.label} className="navGroup">
              {!collapsed && <div className="navGroupLabel">{group.label}</div>}
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`nav ${id === active ? "active" : ""}`}
                  title={label}
                  onClick={() => {
                    onNavigate(id);
                    onCloseMobile();
                  }}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sideBottom">
          <button type="button" className="collapseBtn" onClick={onToggle} title="Toggle sidebar">
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && <div className="sideVersion">v0.9 · Phase 3</div>}
        </div>
      </aside>
    </>
  );
}
