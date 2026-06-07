import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  fetchDmHistory,
  uploadMedia,
  type UploadAsset,
} from "../services/chatApi.service";
import { useMensajeriaStore } from "../store/mensajeria.feature.store";
import type { ChatMessage, MediaAttachment } from "../types";
import { decryptDM, encryptDM, encryptGroup } from "../utils/crypto";

const STOP_TYPING_DELAY = 2500;

export interface SendThreadOptions {
  media?: MediaAttachment | null;
  /** Segundos hasta auto-destrucción (mensaje temporal). */
  ttl?: number | null;
  /** Si false, no se notifica el visto al remitente. */
  allowReadReceipt?: boolean;
}

/**
 * Lógica de una conversación: el grupo ("group") o un DM (user_id del otro).
 * Devuelve los mensajes ordenados, el envío, el "escribiendo..." y los vistos.
 */
export function useChatThread(threadId: string) {
  const isGroup = threadId === "group";
  const socket = useMensajeriaStore((s) => s.socket);

  const currentUser = useMensajeriaStore((s) => s.currentUser);
  const token = useMensajeriaStore((s) => s.token);
  const groupMessages = useMensajeriaStore((s) => s.groupMessages);
  const dmThreads = useMensajeriaStore((s) => s.dmThreads);
  const typingUsers = useMensajeriaStore((s) => s.typingUsers);
  const seenReceipts = useMensajeriaStore((s) => s.seenReceipts);
  const setDmHistory = useMensajeriaStore((s) => s.setDmHistory);
  const onlineUsers = useMensajeriaStore((s) => s.onlineUsers);
  const groupKey = useMensajeriaStore((s) => s.groupKey);
  const keyPair = useMensajeriaStore((s) => s.keyPair);
  const userPublicKeys = useMensajeriaStore((s) => s.userPublicKeys);
  const addDmMessage = useMensajeriaStore((s) => s.addDmMessage);

  const messages: ChatMessage[] = useMemo(
    () => (isGroup ? groupMessages : dmThreads[threadId] ?? []),
    [isGroup, groupMessages, dmThreads, threadId],
  );

  // Cargar historial de DM al abrir el hilo y descifrarlo.
  useEffect(() => {
    if (isGroup || !token) return;
    let cancelled = false;
    fetchDmHistory(threadId, token)
      .then((history) => {
        if (cancelled) return;
        // Las llaves se leen aquí (no como deps) para no re-disparar el fetch.
        const { keyPair: kp, userPublicKeys: keys, currentUser: me } =
          useMensajeriaStore.getState();
        const decoded = history.map((m) => {
          if (!m.content) return m;
          // Los DM propios se cifraron para el destinatario: el remitente no
          // puede descifrarlos (limitación de nacl.box).
          if (m.sender_id === me?.id) {
            return { ...m, content: "🔒 Mensaje cifrado (enviado)" };
          }
          const senderKey = keys[m.sender_id];
          const plaintext =
            senderKey && kp ? decryptDM(m.content, senderKey, kp.secretKey) : null;
          return { ...m, content: plaintext ?? "[mensaje no descifrable]" };
        });
        setDmHistory(threadId, decoded);
      })
      .catch(() => {
        /* sin historial o error de red: se mostrará vacío */
      });
    return () => {
      cancelled = true;
    };
  }, [isGroup, threadId, token, setDmHistory]);

  // Marcar como leídos los mensajes entrantes aún no vistos.
  const markedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!socket || !currentUser) return;
    for (const m of messages) {
      if (
        m.sender_id !== currentUser.id &&
        m.allow_read_receipt &&
        !markedRef.current.has(m.id)
      ) {
        markedRef.current.add(m.id);
        socket.markRead(m.id);
      }
    }
  }, [messages, socket, currentUser]);

  const send = useCallback(
    (content: string, opts?: SendThreadOptions) => {
      const text = content.trim();
      const media = opts?.media ?? null;
      if ((!text && !media) || !socket) return;

      const ttl = opts?.ttl ?? null;
      const allowReadReceipt = opts?.allowReadReceipt ?? true;
      const sendOpts = { media, ttl, allowReadReceipt };

      if (isGroup) {
        // Grupo: cifrado simétrico si hay group_key; si no, texto plano.
        const payload = text ? (groupKey ? encryptGroup(text, groupKey) : text) : "";
        if (payload.length > 1000) {
          Alert.alert("Mensaje demasiado largo", "Acorta el mensaje e intenta de nuevo.");
          return;
        }
        socket.sendGroupMessage(payload, sendOpts);
      } else {
        // DM: cifrado asimétrico con la llave pública del destinatario.
        const recipientKey = userPublicKeys[threadId];
        if (!recipientKey || !keyPair || !currentUser) {
          Alert.alert(
            "No se pudo cifrar",
            "El destinatario aún no tiene llave pública disponible. Pídele que abra la mensajería e intenta de nuevo.",
          );
          return;
        }
        const ciphertext = text ? encryptDM(text, recipientKey, keyPair.secretKey) : "";
        if (ciphertext.length > 1000) {
          Alert.alert("Mensaje demasiado largo", "Acorta el mensaje e intenta de nuevo.");
          return;
        }
        socket.sendDirectMessage(threadId, ciphertext, sendOpts);

        // Inserción optimista: el remitente no puede descifrar su propio eco,
        // así que se muestra el texto plano localmente de inmediato.
        addDmMessage(threadId, {
          id: `local-${Date.now()}`,
          sender_id: currentUser.id,
          sender_nickname: currentUser.nickname,
          content: text,
          type: "dm",
          recipient_id: threadId,
          timestamp: new Date().toISOString(),
          ttl,
          expires_at: null,
          allow_read_receipt: allowReadReceipt,
          media,
        });
      }

      socket.sendStopTyping();
    },
    [socket, isGroup, threadId, groupKey, keyPair, userPublicKeys, currentUser, addDmMessage],
  );

  // Sube un archivo a Cloudinary y lo envía como mensaje con media (Grupo 5).
  const [uploading, setUploading] = useState(false);
  const sendImage = useCallback(
    async (asset: UploadAsset, opts?: SendThreadOptions) => {
      if (!token) return;
      setUploading(true);
      try {
        const media = await uploadMedia(token, asset);
        send("", { ...opts, media });
      } catch (e) {
        Alert.alert(
          "No se pudo enviar el archivo",
          e instanceof Error ? e.message : "Intenta de nuevo.",
        );
      } finally {
        setUploading(false);
      }
    },
    [token, send],
  );

  // "escribiendo..." con auto-stop.
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifyTyping = useCallback(() => {
    if (!socket) return;
    socket.sendTyping(isGroup ? undefined : threadId);
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => socket.sendStopTyping(), STOP_TYPING_DELAY);
  }, [socket, isGroup, threadId]);

  // Quién está escribiendo en este hilo.
  const typingNicknames = useMemo(() => {
    if (isGroup) return Object.values(typingUsers).map((t) => t.nickname);
    const partner = typingUsers[threadId];
    return partner ? [partner.nickname] : [];
  }, [isGroup, typingUsers, threadId]);

  const partner = useMemo(
    () => (isGroup ? null : onlineUsers.find((u) => u.id === threadId) ?? null),
    [isGroup, onlineUsers, threadId],
  );

  return {
    messages,
    currentUser,
    send,
    sendImage,
    uploading,
    notifyTyping,
    typingNicknames,
    seenReceipts,
    isGroup,
    partner,
  };
}
