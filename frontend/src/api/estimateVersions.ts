import { apiFetch } from "./client";

export type EstimateVersionItem = {
  id: string;
  item_no: number;
  description: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  section_name?: string | null;
};

export type EstimateVersion = {
  id: string;
  project_id: string;
  version_no: number;
  name: string;
  overhead_percent: number;
  profit_percent: number;
  contingency_percent: number;
  direct_cost: number;
  overhead: number;
  profit: number;
  contingency: number;
  grand_total: number;
  notes?: string | null;
  items: EstimateVersionItem[];
};

export type EstimateVersionCreate = {
  name: string;
  overhead_percent?: number;
  profit_percent?: number;
  contingency_percent?: number;
  notes?: string | null;
};

export async function listEstimateVersions(
  projectId: string,
): Promise<EstimateVersion[]> {
  return apiFetch<EstimateVersion[]>(`/projects/${projectId}/estimate-versions`);
}

export async function createEstimateVersion(
  projectId: string,
  payload: EstimateVersionCreate,
): Promise<EstimateVersion> {
  return apiFetch<EstimateVersion>(`/projects/${projectId}/estimate-versions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getEstimateVersion(
  projectId: string,
  versionId: string,
): Promise<EstimateVersion> {
  return apiFetch<EstimateVersion>(
    `/projects/${projectId}/estimate-versions/${versionId}`,
  );
}
