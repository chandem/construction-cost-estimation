import { apiFetch } from "./client";

export type SectionSummary = {
  section_id: string | null;
  section_name: string;
  item_count: number;
  subtotal: number;
};

export type ProjectSummary = {
  project_id: string;
  item_count: number;
  direct_cost: number;
  overhead: number;
  profit: number;
  contingency: number;
  grand_total: number;
  sections: SectionSummary[];
};

export async function getProjectSummary(
  projectId: string,
  payload: {
    overhead_percent: number;
    profit_percent: number;
    contingency_percent: number;
  },
): Promise<ProjectSummary> {
  return apiFetch<ProjectSummary>(`/projects/${projectId}/summary`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
