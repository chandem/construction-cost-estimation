const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const API_BASE_URL = configuredApiBaseUrl?.replace(/\/$/, "") || "http://localhost:8000";

async function downloadFile(path: string, filename: string) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadBoqExcel(projectId: string, projectName?: string) {
  const safe = (projectName || "boq").replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 40);
  await downloadFile(`/projects/${projectId}/exports/boq.xlsx`, `${safe}-boq.xlsx`);
}

export async function downloadBoqPdf(projectId: string, projectName?: string) {
  const safe = (projectName || "boq").replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 40);
  await downloadFile(`/projects/${projectId}/exports/boq.pdf`, `${safe}-boq.pdf`);
}
