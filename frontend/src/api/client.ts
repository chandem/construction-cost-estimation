const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const API_BASE_URL =
  configuredApiBaseUrl?.replace(/\/$/, "") || "http://localhost:8000";
const isProduction = Boolean(import.meta.env.PROD);

function getApiConfigurationError(): Error | null {
  if (!configuredApiBaseUrl && isProduction) {
    return new Error(
      "API URL is not configured. Set VITE_API_BASE_URL in the frontend deployment environment and redeploy.",
    );
  }
  return null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const configurationError = getApiConfigurationError();
  if (configurationError) throw configurationError;

  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Unable to reach the API at ${url}. Check that the API is running, ` +
        "VITE_API_BASE_URL is correct, and the API allows this frontend origin.",
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
