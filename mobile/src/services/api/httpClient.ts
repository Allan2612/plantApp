import {
  mapHttpStatus,
  normalizeErrorMessage,
} from "@/src/services/errors/errorMessages";

const HTTP_TIMEOUT_MS = 8000;
const HTTP_UPLOAD_TIMEOUT_MS = 30000;

function parseBackendMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const detail = record.detail;
  const message = record.message;
  const error = record.error;

  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (typeof message === "string" && message.trim()) return message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();

  return null;
}

async function buildHttpError(response: Response): Promise<Error> {
  const payload = await response.json().catch(() => null);
  const backendMessage = parseBackendMessage(payload);
  if (backendMessage) {
    return new Error(backendMessage);
  }

  return new Error(mapHttpStatus(response.status));
}

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
      throw await buildHttpError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    throw new Error(normalizeErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function httpPatch<TResponse, TPayload extends object>(
  url: string,
  payload: TPayload,
  init?: RequestInit,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "PATCH",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await buildHttpError(response);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    throw new Error(normalizeErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function httpPostMultipart<TResponse>(
  url: string,
  formData: FormData,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw await buildHttpError(response);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    throw new Error(normalizeErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function httpPost<TResponse, TPayload extends object>(
  url: string,
  payload: TPayload,
  init?: RequestInit,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await buildHttpError(response);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    throw new Error(normalizeErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}
