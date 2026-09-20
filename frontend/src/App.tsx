import { useEffect, useState } from "react";
import { LayoutDashboard, FolderKanban, ClipboardList, Coins, Calculator, BarChart3, History, Download, Menu, Plus, RefreshCw } from "lucide-react";
import { createProject, listProjects, type Project } from "./api";
import "./styles.css";

const nav = [["Dashboard", LayoutDashboard], ["Projects", FolderKanban], ["BOQ", ClipboardList], ["Cost Rates", Coins], ["Rate Analysis", Calculator], ["Summary", BarChart3], ["Estimate Versions", History], ["Exports", Download]] as const;

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [open, setOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active !== "Projects") return;
    setLoading(true);
    listProjects().then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, [active]);

  return <div className="app">
    <aside className={open ? "sidebar" : "sidebar collapsed"}>
      <div className="brand"><div className="brandMark">CE</div>{open && <div><strong>Cost Estimate</strong><span>Construction QS</span></div>}</div>
      <nav>{nav.map(([label, Icon]) => <button className={active === label ? "nav active" : "nav"} onClick={() => setActive(label)} key={label}><Icon size={19}/>{open && <span>{label}</span>}</button>)}</nav>
      <div className="sideBottom">{open && <small>v0.2 • Ethiopia-ready</small>}</div>
    </aside>
    <main>
      <header><button className="iconBtn" onClick={() => setOpen(!open)}><Menu size={21}/></button><div><div className="eyebrow">CONSTRUCTION COST ESTIMATION</div><h1>{active}</h1></div><div className="headerRight"><span className="statusDot"/> API ready</div></header>
      <section className="content">{active === "Dashboard" ? <Dashboard projectCount={projects.length} onProjects={() => setActive("Projects")} /> : active === "Projects" ? <Projects projects={projects} loading={loading} onCreated={setProjects} /> : <Placeholder title={active}/>}</section>
    </main>
  </div>
}

function Dashboard({projectCount, onProjects}:{projectCount:number,onProjects:()=>void}) {
  return <><div className="hero"><div><p className="eyebrow">ESTIMATING WORKSPACE</p><h2>Build accurate estimates with confidence.</h2><p className="muted">Manage projects, quantities, rates, BOQs and estimate versions in one workspace.</p></div><button className="primary" onClick={onProjects}><Plus size={17}/> New Project</button></div>
    <div className="cards"><Card title="Projects" value={String(projectCount)} icon={<FolderKanban/>}/><Card title="BOQ Items" value="0" icon={<ClipboardList/>}/><Card title="Cost Rates" value="0" icon={<Coins/>}/><Card title="Estimate Value" value="0 ETB" icon={<BarChart3/>}/></div>
    <div className="grid"><div className="panel"><h3>Quick actions</h3><div className="actions"><button onClick={onProjects}>+ Create project</button><button>Upload BOQ</button><button>Manage cost rates</button><button>Run rate analysis</button></div></div><div className="panel"><h3>Estimation workflow</h3><ol><li>Set up your project</li><li>Add BOQ quantities and rates</li><li>Build detailed rate analyses</li><li>Review summary and versions</li><li>Export Excel or PDF</li></ol></div></div></>
}

function Projects({projects, loading, onCreated}:{projects:Project[],loading:boolean,onCreated:(p:Project[])=>void}) {
  const [showForm,setShowForm] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [form,setForm] = useState({name:"",location:"",client_name:"",description:"",currency:"ETB"});

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try { const created = await createProject(form); onCreated([...projects, created]); setForm({name:"",location:"",client_name:"",description:"",currency:"ETB"}); setShowForm(false); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to create project"); }
    finally { setSaving(false); }
  }

  return <div className="stack">
    <div className="pageBar"><div><p className="eyebrow">PROJECT REGISTER</p><h2>Projects</h2><p className="muted">Create and manage construction estimating projects.</p></div><button className="primary" onClick={()=>setShowForm(!showForm)}><Plus size={17}/> New Project</button></div>
    {showForm && <form className="panel form" onSubmit={submit}><div className="formGrid"><label>Project name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>Client name<input value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}/></label><label>Currency<input maxLength={3} value={form.currency} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})}/></label><label className="wide">Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label></div>{error&&<div className="error">{error}</div>}<div className="formActions"><button type="button" className="secondary" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary" disabled={saving}>{saving?"Saving...":"Create Project"}</button></div></form>}
    <div className="panel tablePanel"><div className="tableHead"><h3>Project register</h3>{loading?<span className="muted">Loading...</span>:<span className="muted">{projects.length} project{projects.length===1?"":"s"}</span>}</div>{projects.length===0&&!loading?<div className="emptySmall"><FolderKanban size={30}/><strong>No projects yet</strong><span>Create your first project to start a BOQ.</span></div>:<div className="tableWrap"><table><thead><tr><th>Project</th><th>Location</th><th>Client</th><th>Currency</th></tr></thead><tbody>{projects.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.location||"—"}</td><td>{p.client_name||"—"}</td><td>{p.currency}</td></tr>)}</tbody></table></div>}</div>
  </div>
}

function Card({title,value,icon}:{title:string,value:string,icon:React.ReactNode}){return <div className="card"><div className="cardIcon">{icon}</div><div><span>{title}</span><strong>{value}</strong></div></div>}
function Placeholder({title}:{title:string}){return <div className="empty panel"><div className="emptyIcon">◈</div><h2>{title}</h2><p className="muted">This workspace is ready. The next step is connecting it to the live estimating API.</p><button className="primary"><RefreshCw size={16}/> Coming next</button></div>}
