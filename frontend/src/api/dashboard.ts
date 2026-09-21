import { apiFetch } from "./client";

export type DashboardStats = {
  projects: number;
  categories: number;
  cost_rates: number;
  rate_analyses: number;
  boq_items: number;
  estimate_versions: number;
  total_direct_cost: number;
};

export type SeedResult = {
  categories_created: number;
  rates_created: number;
  message: string;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/dashboard/stats");
}

export async function seedEthiopiaDefaults(): Promise<SeedResult> {
  return apiFetch<SeedResult>("/seed/ethiopia-defaults", { method: "POST" });
}
