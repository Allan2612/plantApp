export async function httpGet<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { method: "GET", ...init });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}
