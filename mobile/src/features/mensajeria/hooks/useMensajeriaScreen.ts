import { useMemo } from "react";

import { useAuthStore } from "@/src/store/auth.store";

import { useMensajeriaStore } from "../store/mensajeria.feature.store";
import type { ChatMessage, ChatUser } from "../types";

function httpAvatar(value?: string | null): string | null {
  const v = value?.trim();
  return v && /^https?:\/\//i.test(v) ? v : null;
}

export interface DmPreview {
  user: ChatUser;
  lastMessage: ChatMessage | null;
}

/** Datos de la pantalla-lista: estado, grupo y usuarios para iniciar un DM. */
export function useMensajeriaScreen() {
  const ready = useMensajeriaStore((s) => s.ready);
  const error = useMensajeriaStore((s) => s.error);
  const status = useMensajeriaStore((s) => s.status);
  const reconnect = useMensajeriaStore((s) => s.reconnect);
  const currentUser = useMensajeriaStore((s) => s.currentUser);
  const onlineUsers = useMensajeriaStore((s) => s.onlineUsers);
  const groupMessages = useMensajeriaStore((s) => s.groupMessages);
  const dmThreads = useMensajeriaStore((s) => s.dmThreads);
  const profile = useAuthStore((s) => s.profile);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const myAvatarUri =
    httpAvatar(profile?.user?.avatarId) ?? httpAvatar(firebaseUser?.photoURL);

  const groupLastMessage = useMemo(
    () => groupMessages[groupMessages.length - 1] ?? null,
    [groupMessages],
  );

  const otherUsers = useMemo(
    () => onlineUsers.filter((u) => u.id !== currentUser?.id),
    [onlineUsers, currentUser],
  );

  const dmPreviews: DmPreview[] = useMemo(() => {
    return otherUsers.map((user) => {
      const thread = dmThreads[user.id] ?? [];
      return { user, lastMessage: thread[thread.length - 1] ?? null };
    });
  }, [otherUsers, dmThreads]);

  return {
    ready,
    error,
    status,
    reconnect,
    currentUser,
    myAvatarUri,
    groupLastMessage,
    dmPreviews,
    onlineCount: otherUsers.length,
  };
}
