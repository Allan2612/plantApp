/**
 * Resolución de URL del chat_backend (Grupo 2 — servidor de chat separado del
 * backend principal de plantApp).
 *
 * El chat_backend vive desplegado en Render, así que SIEMPRE se usa esa URL,
 * tanto en dev como en producción. Para apuntar a un uvicorn local pon:
 *   EXPO_PUBLIC_CHAT_API_URL=http://<tu-ip-lan>:8002
 */

// URL del chat_backend desplegado en Render (Grupo 2).
const DEFAULT_CHAT_URL = "https://chat-backend-4nzg.onrender.com";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function getChatHttpBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_CHAT_API_URL?.trim();
  return stripTrailingSlash(configured || DEFAULT_CHAT_URL);
}

/** Misma base pero con esquema ws/wss para el WebSocket. */
export function getChatWsBaseUrl(): string {
  return getChatHttpBaseUrl().replace(/^http/i, "ws");
}
