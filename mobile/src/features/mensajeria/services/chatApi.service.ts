import { httpGet, httpPost } from "@/src/services/api/httpClient";

import { getChatHttpBaseUrl } from "../config";
import type {
  ChatMessage,
  ChatUser,
  JoinResponse,
  MediaAttachment,
} from "../types";

function base(): string {
  return getChatHttpBaseUrl();
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// El plan gratuito de Render apaga el servicio tras inactividad y el cold start
// tarda 30-60s. El join usa un timeout largo + un reintento para sobrevivirlo,
// en vez del httpClient compartido (que aborta a los 8s).
const JOIN_TIMEOUT_MS = 60000;

/**
 * Registra un nickname y obtiene token JWT del chat_backend.
 * El backend deduplica por nickname: el mismo nombre devuelve el mismo usuario.
 */
export async function joinChat(nickname: string): Promise<JoinResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), JOIN_TIMEOUT_MS);
    try {
      const res = await fetch(`${base()}/api/chat/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`El servidor de chat respondió ${res.status}.`);
      }
      return (await res.json()) as JoinResponse;
    } catch (e) {
      lastError = e;
      // Reintenta una vez: el primer intento suele despertar el servidor.
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw new Error(
    lastError instanceof Error && lastError.name === "AbortError"
      ? "El servidor de chat tardó demasiado en responder. Intenta de nuevo."
      : "No se pudo conectar al servidor de chat.",
  );
}

/** Registra la llave pública Curve25519 del usuario (encriptación, Grupo 4). */
export async function registerPublicKey(
  token: string,
  publicKey: string,
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${base()}/api/chat/users/me/public-key`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ public_key: publicKey }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`No se pudo registrar la llave pública (${res.status}).`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Cierra sesión revocando el token actual. */
export async function logoutChat(token: string): Promise<void> {
  await httpPost<{ status: string }, Record<string, never>>(
    `${base()}/api/chat/logout`,
    {},
    { headers: authHeaders(token) },
  );
}

/** Usuarios conectados ahora mismo. */
export async function fetchOnlineUsers(): Promise<ChatUser[]> {
  return httpGet<ChatUser[]>(`${base()}/api/chat/users`);
}

// Subida de archivos a Cloudinary (Grupo 5). Timeout largo para archivos grandes.
const UPLOAD_TIMEOUT_MS = 60000;

export interface UploadAsset {
  uri: string;
  name: string;
  mimeType: string;
}

/** Sube un archivo al chat_backend (Cloudinary) y devuelve el MediaAttachment. */
export async function uploadMedia(
  token: string,
  asset: UploadAsset,
): Promise<MediaAttachment> {
  const form = new FormData();
  // RN: el archivo se adjunta como { uri, name, type }.
  form.append("file", {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType,
  } as unknown as Blob);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(`${base()}/api/chat/media/upload`, {
      method: "POST",
      headers: authHeaders(token), // sin Content-Type: fetch lo pone con boundary
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`No se pudo subir el archivo (${res.status}).`);
    }
    return (await res.json()) as MediaAttachment;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Historial del chat grupal (persistido en el servidor). */
export async function fetchGroupHistory(limit = 50): Promise<ChatMessage[]> {
  return httpGet<ChatMessage[]>(`${base()}/api/chat/messages?limit=${limit}`);
}

/** Historial de DMs entre el usuario actual y `otherId`. */
export async function fetchDmHistory(
  otherId: string,
  token: string,
): Promise<ChatMessage[]> {
  return httpGet<ChatMessage[]>(
    `${base()}/api/chat/messages/dm/${otherId}`,
    { headers: authHeaders(token) },
  );
}
