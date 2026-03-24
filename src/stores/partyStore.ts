import { create } from 'zustand';
import type { Player, GameType, GameState } from '@/types';

interface PartyState {
  roomCode: string;
  players: Player[];
  currentPlayerId: string | null;
  isLeader: boolean;
  gameState: GameState;
  currentGame: GameType | null;
  isConnecting: boolean;
  error: string | null;

  setRoomCode: (code: string) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setCurrentPlayerId: (id: string | null) => void;
  setIsLeader: (isLeader: boolean) => void;
  setGameState: (state: GameState) => void;
  setCurrentGame: (game: GameType | null) => void;
  setIsConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  leaveParty: () => void;
  reset: () => void;
}

const initialState = {
  roomCode: '',
  players: [],
  currentPlayerId: null,
  isLeader: false,
  gameState: 'lobby' as GameState,
  currentGame: null,
  isConnecting: false,
  error: null,
};

export const usePartyStore = create<PartyState>()((set) => ({
  ...initialState,

  setRoomCode: (code) => set({ roomCode: code }),
  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: state.players.find((p) => p.id === player.id)
        ? state.players.map((p) => (p.id === player.id ? player : p))
        : [...state.players, player],
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),

  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  setIsLeader: (isLeader) => set({ isLeader }),
  setGameState: (gameState) => set({ gameState }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),

  leaveParty: () => set({ ...initialState }),
  reset: () => set({ ...initialState }),
}));
