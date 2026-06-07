import { getChatWsBaseUrl } from "../config";
import type { MediaAttachment, WsEvent } from "../types";

type EventHandler = (event: WsEvent) => void;
type StatusHandler = (status: "open" | "closed" | "error") => void;

export interface SendOptions {
  media?: MediaAttachment | null;
  /** Segundos hasta auto-destrucción (mensaje temporal). */
  ttl?: number | null;
  /** Si false, no se notifica el visto al remitente. */
  allowReadReceipt?: boolean;
}

/** Convierte SendOptions al formato del protocolo, omitiendo campos vacíos. */
function buildOpts(opts?: SendOptions): Record<string, unknown> {
  if (!opts) return {};
  const out: Record<string, unknown> = {};
  if (opts.media) out.media = opts.media;
  if (opts.ttl != null) out.ttl = opts.ttl;
  if (opts.allowReadReceipt === false) out.allow_read_receipt = false;
  return out;
}

/**
 * Cliente WebSocket del chat. Envuelve el WebSocket global de React Native.
 *
 * Conecta a  ws(s)://<host>/ws/<token>  y emite los eventos del servidor
 * (group_message, dm, typing, users_list, ...) a quien se suscriba con onEvent.
 *
 * Incluye reconexión automática con backoff y ping de keep-alive.
 */
export class ChatSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private eventHandler: EventHandler | null = null;
  private statusHandler: StatusHandler | null = null;
  private authErrorHandler: (() => void) | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private closedByUser = false;

  constructor(token: string) {
    this.token = token;
  }

  onEvent(handler: EventHandler): void {
    this.eventHandler = handler;
  }

  onStatus(handler: StatusHandler): void {
    this.statusHandler = handler;
  }

  /** Se invoca cuando el servidor rechaza el token (cierre 4001): re-join. */
  onAuthError(handler: () => void): void {
    this.authErrorHandler = handler;
  }

  connect(): void {
    this.closedByUser = false;
    const url = `${getChatWsBaseUrl()}/ws/${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.statusHandler?.("open");
      this.startPing();
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as WsEvent;
        this.eventHandler?.(data);
      } catch {
        // mensaje no-JSON: ignorar
      }
    };

    this.ws.onerror = () => {
      this.statusHandler?.("error");
    };

    this.ws.onclose = (e) => {
      this.stopPing();
      this.statusHandler?.("closed");
      if (this.closedByUser) return;
      // 4001 = token inválido (expirado o el server perdió el usuario al
      // reiniciar). Reintentar con el mismo token es inútil → re-join.
      if ((e as CloseEvent).code === 4001) {
        this.authErrorHandler?.();
        return;
      }
      this.scheduleReconnect();
    };
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.send({ type: "ping" });
    }, 25000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 15000);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.closedByUser) this.connect();
    }, delay);
  }

  private send(payload: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  // ── Acciones cliente → servidor ────────────────────────────────────────────

  sendGroupMessage(content: string, opts?: SendOptions): void {
    this.send({ type: "group_message", content, ...buildOpts(opts) });
  }

  sendDirectMessage(toUserId: string, content: string, opts?: SendOptions): void {
    this.send({ type: "dm", to: toUserId, content, ...buildOpts(opts) });
  }

  markRead(messageId: string): void {
    this.send({ type: "mark_read", message_id: messageId });
  }

  sendTyping(toUserId?: string): void {
    this.send(toUserId ? { type: "typing", to: toUserId } : { type: "typing" });
  }

  sendStopTyping(): void {
    this.send({ type: "stop_typing" });
  }

  disconnect(): void {
    this.closedByUser = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}
