/**
 * Tipos del chat — espejo del protocolo del chat_backend (FastAPI + WebSocket).
 * MVP texto plano: sin encriptación.
 */

export interface ChatUser {
  id: string;
  nickname: string;
  joined_at: string;
  is_online: boolean;
  public_key?: string | null;
}

export type ChatMessageType = "group" | "dm";

export interface MediaAttachment {
  url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw";
  format: string;
  size_bytes: number;
  original_filename: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_nickname: string;
  content: string;
  type: ChatMessageType;
  recipient_id?: string | null;
  timestamp: string;
  ttl?: number | null;
  expires_at?: string | null;
  allow_read_receipt: boolean;
  media?: MediaAttachment | null;
}

export interface JoinResponse {
  user: ChatUser;
  token: string;
}

// ── Eventos WebSocket (servidor → cliente) ───────────────────────────────────

export type WsEvent =
  | { type: "group_message"; message: ChatMessage }
  | { type: "dm"; message: ChatMessage }
  | { type: "message_seen"; message_id: string; seen_by: string; seen_at: string }
  | { type: "message_expired"; message_id: string }
  | { type: "typing"; user_id: string; nickname: string }
  | { type: "stop_typing"; user_id: string }
  | { type: "user_joined"; user: ChatUser }
  | { type: "user_left"; user_id: string }
  | { type: "users_list"; users: ChatUser[] }
  | { type: "group_history"; messages: ChatMessage[] }
  | { type: "group_key"; key: string }
  | { type: "pong" }
  | { type: "error"; message: string };

// ── Estado de conexión ───────────────────────────────────────────────────────

export type ChatConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/** Conversación: el chat grupal o un DM con otro usuario. */
export type ThreadId = "group" | string; // "group" o el user_id del otro
