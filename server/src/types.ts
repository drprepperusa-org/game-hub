export interface Player {
  id: string;
  username: string;
  avatar: string;
  isLeader: boolean;
  score: number;
  isReady: boolean;
  socketId: string;
}

export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  avatar: string;
}

export type GameType = 'hippos' | 'jeopardy' | 'trivia';
export type GameState = 'lobby' | 'selecting' | 'playing' | 'results';

export interface Party {
  roomCode: string;
  players: Player[];
  leaderId: string;
  gameState: GameState;
  currentGame: GameType | null;
  messages: Message[];
  gameData: Record<string, unknown>;
}

export interface HippoTarget {
  id: string;
  x: number;
  y: number;
  isPopped: boolean;
  spawnTime: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: string;
  timeLimit: number;
}

export interface GameResult {
  playerId: string;
  username: string;
  avatar: string;
  score: number;
  rank: number;
}
