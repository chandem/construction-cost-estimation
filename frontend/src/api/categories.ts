import { apiFetch } from "./client";

export type Category = {
  id: string;
  name: string;
  description?: string | null;
};

export async function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/cost-categories");
}

export async function createCategory(payload: {
  name: string;
  description?: string | null;
}): Promise<Category> {
  return apiFetch<Category>("/cost-categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<void>(`/cost-categories/${id}`, { method: "DELETE" });
}
