import { apiFetch } from "./client";

export type Project = {
  id: string;
  name: string;
  location?: string | null;
  client_name?: string | null;
  description?: string | null;
  currency: string;
};

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

export async function createProject(project: Omit<Project, "id">): Promise<Project> {
  return apiFetch<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}
