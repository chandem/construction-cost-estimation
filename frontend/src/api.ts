const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";

export type Project = {
  id: string;
  name: string;
  location?: string | null;
  client_name?: string | null;
  description?: string | null;
  currency: string;
};

export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) throw new Error(`Unable to load projects (${response.status})`);
  return response.json();
}

export async function createProject(project: Omit<Project, "id">): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error(`Unable to create project (${response.status})`);
  return response.json();
}