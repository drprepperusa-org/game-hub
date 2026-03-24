import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AVATARS = ['🦊', '🐱', '🐻', '🐼', '🦁', '🐸', '🐺', '🦄', '🐯', '🐨', '🦖', '🦕'];

interface AuthState {
  username: string;
  avatar: string;
  socketId: string | null;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  setSocketId: (id: string | null) => void;
  randomAvatar: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      username: '',
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      socketId: null,

      setUsername: (username) => set({ username }),
      setAvatar: (avatar) => set({ avatar }),
      setSocketId: (id) => set({ socketId: id }),
      randomAvatar: () => {
        const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        set({ avatar });
        return avatar;
      },
    }),
    {
      name: 'game-hub-auth',
      partialize: (state) => ({ username: state.username, avatar: state.avatar }),
    }
  )
);

export { AVATARS };
