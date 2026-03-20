const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

const fallbackBase = `http://${hostname}:8000`;

export const API_BASE: string =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "" : fallbackBase);

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
