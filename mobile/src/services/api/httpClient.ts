const DEFAULT_ATTEMPT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_RETRY_DELAYS_MS = [1200, 2400, 4000, 7000];

const RETRYABLE_HTTP_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface HttpGetOptions {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelaysMs?: number[];
  onRetry?: (attempt: number, nextDelayMs: number, reason: string) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "La solicitud tardó demasiado en responder.";
    }
    return error.message;
  }
  return "Error de red inesperado.";
}

function shouldRetryStatus(status: number): boolean {
  return RETRYABLE_HTTP_STATUS.has(status);
}

export async function httpGet<T>(
  url: string,
  init?: RequestInit,
  options?: HttpGetOptions,
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_ATTEMPT_TIMEOUT_MS;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelays = options?.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;

  let attempt = 0;
  let lastReason = "Error de red inesperado.";

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        ...init,
        signal: controller.signal,
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      lastReason = `HTTP ${response.status}`;
      if (!shouldRetryStatus(response.status) || attempt === maxRetries) {
        throw new Error(lastReason);
      }
    } catch (error) {
      lastReason = normalizeErrorMessage(error);
      if (attempt === maxRetries) {
        throw new Error(lastReason);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const nextDelayMs = retryDelays[attempt] ?? retryDelays[retryDelays.length - 1] ?? 2000;
    options?.onRetry?.(attempt + 1, nextDelayMs, lastReason);
    await sleep(nextDelayMs);
    attempt += 1;
  }

  throw new Error(lastReason);
}
