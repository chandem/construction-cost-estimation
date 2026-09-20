import { apiFetch } from "./client";

export type CostRate = {
  id: string;
  category_id: string;
  code: string;
  name: string;
  unit: string;
  rate: number;
  currency: string;
  region?: string | null;
  source?: string | null;
  effective_date?: string | null;
  notes?: string | null;
};

export async function listRates(): Promise<CostRate[]> {
  return apiFetch<CostRate[]>("/rates");
}

export async function createRate(payload: Partial<CostRate>): Promise<CostRate> {
  return apiFetch<CostRate>("/rates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
