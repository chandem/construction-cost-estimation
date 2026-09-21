import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { listProjects, type Project } from "../api/projects";

type Toast = { id: number; type: "success" | "error" | "info"; message: string };

type AppContextValue = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | null;
  loading: boolean;
  bootError: string;
  refreshProjects: () => Promise<void>;
  toasts: Toast[];
  pushToast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: number) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

let toastSeq = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState(
    () => localStorage.getItem("selected_project_id") || "",
  );
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const setSelectedProjectId = useCallback((id: string) => {
    setSelectedProjectIdState(id);
    if (id) localStorage.setItem("selected_project_id", id);
    else localStorage.removeItem("selected_project_id");
  }, []);

  const pushToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshProjects = useCallback(async () => {
    const rows = await listProjects();
    setProjects(rows);
    if (rows.length && !rows.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(rows[0].id);
    }
    if (!rows.length) setSelectedProjectId("");
  }, [selectedProjectId, setSelectedProjectId]);

  useEffect(() => {
    async function boot() {
      try {
        setLoading(true);
        setBootError("");
        await refreshProjects();
      } catch (err) {
        setBootError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    void boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const value = useMemo(
    () => ({
      projects,
      setProjects,
      selectedProjectId,
      setSelectedProjectId,
      selectedProject,
      loading,
      bootError,
      refreshProjects,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      projects,
      selectedProjectId,
      setSelectedProjectId,
      selectedProject,
      loading,
      bootError,
      refreshProjects,
      toasts,
      pushToast,
      dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
