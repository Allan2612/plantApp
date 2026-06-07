import { useAuthStore } from "@/src/store/auth.store";
import { useEffect } from "react";

import { joinChat, registerPublicKey } from "../services/chatApi.service";
import { ChatSocket } from "../services/chatSocket";
import { useMensajeriaStore } from "../store/mensajeria.feature.store";
import type { ChatMessage, WsEvent } from "../types";
import { decryptDM, decryptGroup, generateKeyPair } from "../utils/crypto";
import { loadKeyPair, saveKeyPair } from "../utils/keyStore";

const TYPING_TTL_MS = 4000;

function resolveNickname(): string {
  const profile = useAuthStore.getState().profile;
  const user = profile?.user;
  return (
    user?.displayName?.trim() ||
    user?.username?.trim() ||
    user?.email?.split("@")[0] ||
    "Invitado"
  );
}

/**
 * Monta la conexión al chat (join + WebSocket) mientras esté presente en el
 * árbol. Escribe todo el estado al store, de modo que cualquier pantalla
 * (incluida la ruta de hilo fuera de este árbol) lo lea desde el store.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let lastAuthRejoin = 0;
    const store = useMensajeriaStore.getState;
    const nickname = resolveNickname();

    // El servidor rechazó el token (4001): re-join con nuevo token. Guarda de
    // 5s para no entrar en bucle si el re-join también fallara.
    function handleAuthError() {
      const now = Date.now();
      if (cancelled || now - lastAuthRejoin < 5000) return;
      lastAuthRejoin = now;
      store().setSocket(null);
      store().setReady(false);
      bootstrap();
    }

    async function bootstrap() {
      store().setStatus("connecting");
      store().setError(null);
      try {
        const { user, token } = await joinChat(nickname);
        if (cancelled) return;

        store().setSession(token, user);

        // Encriptación (Grupo 4): cargar o generar par de llaves, persistirlo y
        // registrar la llave pública ANTES de conectar el WebSocket.
        let kp = await loadKeyPair(user.id);
        if (!kp) {
          kp = generateKeyPair();
          await saveKeyPair(kp, user.id);
        }
        if (cancelled) return;
        store().setKeyPair(kp);
        store().mergePublicKeys({ [user.id]: kp.publicKey });
        try {
          await registerPublicKey(token, kp.publicKey);
        } catch {
          // Si falla el registro, los DMs no se podrán cifrar hacia este usuario,
          // pero el resto del chat sigue funcionando.
        }
        if (cancelled) return;

        const socket = new ChatSocket(token);
        socket.onStatus((s) => {
          store().setStatus(
            s === "open" ? "connected" : s === "error" ? "error" : "disconnected",
          );
        });
        socket.onEvent((event) => dispatchEvent(event, user.id));
        socket.onAuthError(handleAuthError);
        socket.connect();

        store().setSocket(socket);
        store().setReady(true);
      } catch (e) {
        if (cancelled) return;
        store().setError(
          e instanceof Error ? e.message : "No se pudo conectar al chat.",
        );
        store().setStatus("error");
      }
    }

    bootstrap();

    // Permite reintentar desde la UI (p. ej. tras un cold start de Render).
    store().setReconnect(() => {
      store().socket?.disconnect();
      store().setSocket(null);
      store().setReady(false);
      bootstrap();
    });

    // Barrido de "escribiendo..." vencidos.
    const sweep = setInterval(() => {
      const now = Date.now();
      const typing = store().typingUsers;
      for (const [userId, info] of Object.entries(typing)) {
        if (now - info.at > TYPING_TTL_MS) store().clearTyping(userId);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(sweep);
      store().socket?.disconnect();
      store().reset();
    };
  }, []);

  return <>{children}</>;
}

/** Descifra el contenido de un mensaje grupal según la group_key actual. */
function decodeGroup(msg: ChatMessage, groupKey: string | null): ChatMessage {
  if (!groupKey || !msg.content) return msg; // sin clave o solo-media → tal cual
  const plaintext = decryptGroup(msg.content, groupKey);
  return { ...msg, content: plaintext ?? "[mensaje no descifrable]" };
}

function dispatchEvent(event: WsEvent, myId: string): void {
  const s = useMensajeriaStore.getState();
  switch (event.type) {
    case "group_history":
      // group_key suele llegar DESPUÉS; si ya está, descifra ahora.
      s.setGroupHistory(event.messages.map((m) => decodeGroup(m, s.groupKey)));
      break;
    case "group_message":
      s.addGroupMessage(decodeGroup(event.message, s.groupKey));
      break;
    case "group_key": {
      const key = event.key || null;
      s.setGroupKey(key);
      // Redescifra el historial ya recibido con la clave recién llegada.
      if (key) {
        s.setGroupHistory(s.groupMessages.map((m) => decodeGroup(m, key)));
      }
      break;
    }
    case "dm": {
      // El remitente NO puede descifrar su propio eco (nacl.box) → se ignora;
      // el mensaje propio ya se mostró por inserción optimista al enviar.
      if (event.message.sender_id === myId) break;
      let content = "";
      if (event.message.content) {
        const senderKey = s.userPublicKeys[event.message.sender_id];
        const plaintext =
          senderKey && s.keyPair
            ? decryptDM(event.message.content, senderKey, s.keyPair.secretKey)
            : null;
        content = plaintext ?? "[mensaje no descifrable]";
      }
      s.addDmMessage(event.message.sender_id, { ...event.message, content });
      break;
    }
    case "users_list": {
      const entries: Record<string, string> = {};
      event.users.forEach((u) => {
        if (u.public_key) entries[u.id] = u.public_key;
      });
      s.mergePublicKeys(entries);
      s.setOnlineUsers(event.users);
      break;
    }
    case "user_joined":
      if (event.user.public_key) {
        s.mergePublicKeys({ [event.user.id]: event.user.public_key });
      }
      s.upsertUser(event.user);
      break;
    case "user_left":
      s.removeUser(event.user_id);
      s.clearTyping(event.user_id);
      break;
    case "typing":
      if (event.user_id !== myId) s.setTyping(event.user_id, event.nickname);
      break;
    case "stop_typing":
      s.clearTyping(event.user_id);
      break;
    case "message_seen":
      s.markSeen(event.message_id, {
        seen_by: event.seen_by,
        seen_at: event.seen_at,
      });
      break;
    case "message_expired":
      s.removeMessage(event.message_id);
      break;
    case "pong":
      break;
    case "error":
      console.warn("[chat] error del servidor:", event.message);
      break;
  }
}
