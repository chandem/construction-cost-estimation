import { apiFetch } from "./client";

export type BOQSection = {
  id: string;
  project_id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  sort_order: number;
};

export type BOQItem = {
  id: string;
  item_no: number;
  description: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  section_id?: string | null;
  rate_analysis_id?: string | null;
};

export async function listSections(projectId: string): Promise<BOQSection[]> {
  return apiFetch<BOQSection[]>(`/projects/${projectId}/boq/sections`);
}

export async function createSection(
  projectId: string,
  payload: Partial<BOQSection>,
): Promise<BOQSection> {
  return apiFetch<BOQSection>(`/projects/${projectId}/boq/sections`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listBOQ(projectId: string): Promise<BOQItem[]> {
  return apiFetch<BOQItem[]>(`/projects/${projectId}/boq`);
}

export async function createBOQ(
  projectId: string,
  payload: Partial<BOQItem>,
): Promise<BOQItem> {
  return apiFetch<BOQItem>(`/projects/${projectId}/boq`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
