import { apiFetch } from "./client";

export type RateAnalysisComponent = {
  id?: string;
  cost_rate_id: string;
  quantity: number;
  waste_percent: number;
  unit_rate_snapshot?: number;
  amount?: number;
};

export type RateAnalysis = {
  id: string;
  code: string;
  description: string;
  unit: string;
  region?: string | null;
  currency: string;
  components: RateAnalysisComponent[];
  direct_cost: number;
};

export type RateAnalysisCreate = {
  code: string;
  description: string;
  unit: string;
  region?: string | null;
  currency?: string;
  components: {
    cost_rate_id: string;
    quantity: number;
    waste_percent: number;
  }[];
};

export async function listRateAnalyses(): Promise<RateAnalysis[]> {
  return apiFetch<RateAnalysis[]>("/rate-analyses");
}

export async function createRateAnalysis(
  payload: RateAnalysisCreate,
): Promise<RateAnalysis> {
  return apiFetch<RateAnalysis>("/rate-analyses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
