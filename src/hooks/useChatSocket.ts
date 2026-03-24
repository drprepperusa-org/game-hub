import { useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export const useChatSocket = () => {
  const sendMessage = useCallback((text: string) => {
    const { username, avatar } = useAuthStore.getState();
    getSocket().emit('send-message', { text, username, avatar });
  }, []);

  return { sendMessage };
};
