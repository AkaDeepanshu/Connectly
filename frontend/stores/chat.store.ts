import { Room, Message } from "@/services/chat/chat.types";
import { create } from "zustand";

interface ChatState {
  // Rooms
  rooms: Room[];
  activeRoomId: string | null;

  // Messages — keyed by roomId
  messages: Record<string, Message[]>;

  // Pagination cursors — oldest message id fetched per room
  cursors: Record<string, string | null>;

  // Whether there are more older messages to load per room
  hasMore: Record<string, boolean>;

  // ── Room actions ──────────────────────────────────────
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  updateRoomLastMessage: (roomId: string, message: Message) => void;

  // ── Message actions ───────────────────────────────────

  // Initial load — replaces messages for a room (newest first from API, we reverse)
  setMessages: (roomId: string, messages: Message[], nextCursor: string | null, hasMore: boolean) => void;

  // Prepend older messages (pagination — scroll up)
  prependMessages: (roomId: string, messages: Message[], nextCursor: string | null, hasMore: boolean) => void;

  // Append a new incoming message (socket or optimistic)
  addMessage: (roomId: string, message: Message) => void;

  // Replace optimistic message with confirmed one (matched by client_msg_id)
  confirmMessage: (roomId: string, clientMsgId: string, confirmedMessage: Message) => void;

  // Update message content (edit)
  updateMessage: (roomId: string, messageId: string, newContent: string) => void;

  // Remove message
  removeMessage: (roomId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  cursors: {},
  hasMore: {},

  setRooms: (rooms) => set({ rooms }),

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  updateRoomLastMessage: (roomId, message) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              lastMessage: message.content ?? "",
              lastMessageTime: message.created_at,
            }
          : r
      ),
    })),

  setMessages: (roomId, messages, nextCursor, hasMore) =>
    set((state) => ({
      messages: {
        ...state.messages,
        // API returns newest-first, reverse so oldest is at top
        [roomId]: [...messages].reverse(),
      },
      cursors: { ...state.cursors, [roomId]: nextCursor },
      hasMore: { ...state.hasMore, [roomId]: hasMore },
    })),

  prependMessages: (roomId, messages, nextCursor, hasMore) =>
    set((state) => ({
      messages: {
        ...state.messages,
        // Older messages go before existing ones; API returns newest-first so reverse
        [roomId]: [...[...messages].reverse(), ...(state.messages[roomId] ?? [])],
      },
      cursors: { ...state.cursors, [roomId]: nextCursor },
      hasMore: { ...state.hasMore, [roomId]: hasMore },
    })),

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] ?? []), message],
      },
    })),

  confirmMessage: (roomId, clientMsgId, confirmedMessage) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] ?? []).map((m) =>
          m.client_msg_id === clientMsgId ? confirmedMessage : m
        ),
      },
    })),

  updateMessage: (roomId, messageId, newContent) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] ?? []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, is_edited: true } : m
        ),
      },
    })),

  removeMessage: (roomId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] ?? []).filter((m) => m.id !== messageId),
      },
    })),
}));