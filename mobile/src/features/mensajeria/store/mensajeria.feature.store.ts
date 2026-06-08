import { create } from "zustand";

import type { ChatSocket } from "../services/chatSocket";
import type {
  ChatConnectionStatus,
  ChatMessage,
  ChatUser,
} from "../types";
import type { KeyPair } from "../utils/crypto";

interface SeenReceipt {
  seen_by: string;
  seen_at: string;
}

interface TypingUser {
  nickname: string;
  at: number;
}

interface MensajeriaState {
  status: ChatConnectionStatus;
  /** true cuando join + socket ya están listos. */
  ready: boolean;
  /** Mensaje de error de conexión (join fallido), o null. */
  error: string | null;
  /** Instancia del socket activo, compartida entre pantallas. */
  socket: ChatSocket | null;
  /** Reintenta join + conexión (lo setea ChatProvider). */
  reconnect: (() => void) | null;
  token: string | null;
  currentUser: ChatUser | null;

  // ── Encriptación (Grupo 4) ──
  /** Par de llaves del usuario actual. */
  keyPair: KeyPair | null;
  /** Llave simétrica del grupo (null = grupo en texto plano). */
  groupKey: string | null;
  /** Llaves públicas de otros usuarios, por user_id (para DM). */
  userPublicKeys: Record<string, string>;

  onlineUsers: ChatUser[];
  groupMessages: ChatMessage[];
  /** DMs por id del otro usuario. */
  dmThreads: Record<string, ChatMessage[]>;
  /** Usuarios escribiendo ahora, por user_id. */
  typingUsers: Record<string, TypingUser>;
  /** Vistos por message_id (para el doble-check de mensajes propios). */
  seenReceipts: Record<string, SeenReceipt>;

  setStatus: (status: ChatConnectionStatus) => void;
  setReady: (ready: boolean) => void;
  setError: (error: string | null) => void;
  setSocket: (socket: ChatSocket | null) => void;
  setReconnect: (fn: (() => void) | null) => void;
  setSession: (token: string, user: ChatUser) => void;

  setKeyPair: (kp: KeyPair) => void;
  setGroupKey: (key: string | null) => void;
  mergePublicKeys: (entries: Record<string, string>) => void;

  setOnlineUsers: (users: ChatUser[]) => void;
  upsertUser: (user: ChatUser) => void;
  removeUser: (userId: string) => void;

  setGroupHistory: (messages: ChatMessage[]) => void;
  addGroupMessage: (message: ChatMessage) => void;

  setDmHistory: (otherId: string, messages: ChatMessage[]) => void;
  addDmMessage: (otherId: string, message: ChatMessage) => void;

  setTyping: (userId: string, nickname: string) => void;
  clearTyping: (userId: string) => void;

  markSeen: (messageId: string, receipt: SeenReceipt) => void;
  removeMessage: (messageId: string) => void;

  reset: () => void;
}

const initialState = {
  status: "idle" as ChatConnectionStatus,
  ready: false,
  error: null,
  socket: null,
  reconnect: null,
  token: null,
  currentUser: null,
  keyPair: null,
  groupKey: null,
  userPublicKeys: {},
  onlineUsers: [],
  groupMessages: [],
  dmThreads: {},
  typingUsers: {},
  seenReceipts: {},
};

export const useMensajeriaStore = create<MensajeriaState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setReady: (ready) => set({ ready }),
  setError: (error) => set({ error }),
  setSocket: (socket) => set({ socket }),
  setReconnect: (reconnect) => set({ reconnect }),
  setSession: (token, currentUser) => set({ token, currentUser }),

  setKeyPair: (keyPair) => set({ keyPair }),
  setGroupKey: (groupKey) => set({ groupKey }),
  mergePublicKeys: (entries) =>
    set((state) => ({
      userPublicKeys: { ...state.userPublicKeys, ...entries },
    })),

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  upsertUser: (user) =>
    set((state) => {
      const exists = state.onlineUsers.some((u) => u.id === user.id);
      return {
        onlineUsers: exists
          ? state.onlineUsers.map((u) => (u.id === user.id ? user : u))
          : [...state.onlineUsers, user],
      };
    }),
  removeUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.id !== userId),
    })),

  setGroupHistory: (groupMessages) => set({ groupMessages }),
  addGroupMessage: (message) =>
    set((state) =>
      state.groupMessages.some((m) => m.id === message.id)
        ? state
        : { groupMessages: [...state.groupMessages, message] },
    ),

  setDmHistory: (otherId, messages) =>
    set((state) => ({
      dmThreads: { ...state.dmThreads, [otherId]: messages },
    })),
  addDmMessage: (otherId, message) =>
    set((state) => {
      const current = state.dmThreads[otherId] ?? [];
      if (current.some((m) => m.id === message.id)) return state;
      return {
        dmThreads: { ...state.dmThreads, [otherId]: [...current, message] },
      };
    }),

  setTyping: (userId, nickname) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: { nickname, at: Date.now() },
      },
    })),
  clearTyping: (userId) =>
    set((state) => {
      if (!state.typingUsers[userId]) return state;
      const next = { ...state.typingUsers };
      delete next[userId];
      return { typingUsers: next };
    }),

  markSeen: (messageId, receipt) =>
    set((state) => ({
      seenReceipts: { ...state.seenReceipts, [messageId]: receipt },
    })),
  removeMessage: (messageId) =>
    set((state) => {
      const dmThreads: Record<string, ChatMessage[]> = {};
      for (const [key, msgs] of Object.entries(state.dmThreads)) {
        dmThreads[key] = msgs.filter((m) => m.id !== messageId);
      }
      return {
        groupMessages: state.groupMessages.filter((m) => m.id !== messageId),
        dmThreads,
      };
    }),

  reset: () => set({ ...initialState }),
}));
