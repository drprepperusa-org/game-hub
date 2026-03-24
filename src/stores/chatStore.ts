import { create } from 'zustand';
import type { Message } from '@/types';

interface ChatState {
  messages: Message[];
  unreadCount: number;
  isChatOpen: boolean;

  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearChat: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages.slice(-99), message],
    })),

  setMessages: (messages) => set({ messages }),

  clearChat: () => set({ messages: [], unreadCount: 0 }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  resetUnread: () => set({ unreadCount: 0 }),

  setChatOpen: (open) =>
    set({ isChatOpen: open, unreadCount: open ? 0 : undefined } as Partial<ChatState>),
}));
