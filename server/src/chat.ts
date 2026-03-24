import type { Server } from 'socket.io';
import type { Message } from './types';

const MAX_MESSAGE_LENGTH = 200;

export const sanitizeMessage = (text: string): string => {
  return text.trim().slice(0, MAX_MESSAGE_LENGTH);
};

export const broadcastMessage = (io: Server, roomCode: string, message: Message): void => {
  io.to(roomCode).emit('message', message);
};
