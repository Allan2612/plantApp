const HTTP_TIMEOUT_MS = 8000;

export async function httpGet<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("La solicitud agotó el tiempo de espera.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
