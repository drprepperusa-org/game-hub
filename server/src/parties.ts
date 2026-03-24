import type { Party, Player, Message, GameType } from './types';

const uuidGen = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
});
const uuid = uuidGen;

const parties = new Map<string, Party>();

export const createParty = (roomCode: string, leader: Player): Party => {
  const party: Party = {
    roomCode,
    players: [leader],
    leaderId: leader.id,
    gameState: 'lobby',
    currentGame: null,
    messages: [],
    gameData: {},
  };
  parties.set(roomCode, party);
  return party;
};

export const getParty = (roomCode: string): Party | undefined => {
  return parties.get(roomCode);
};

export const getPartyBySocketId = (socketId: string): Party | undefined => {
  for (const party of parties.values()) {
    if (party.players.some(p => p.socketId === socketId)) {
      return party;
    }
  }
  return undefined;
};

export const addPlayer = (roomCode: string, player: Player): Party | null => {
  const party = parties.get(roomCode);
  if (!party) return null;
  if (party.players.length >= 8) return null;

  // Check if reconnecting
  const existing = party.players.find(p => p.username === player.username);
  if (existing) {
    existing.socketId = player.socketId;
    existing.id = player.id;
    return party;
  }

  party.players.push(player);
  return party;
};

export const removePlayer = (socketId: string): { party: Party; removedId: string } | null => {
  for (const [code, party] of parties.entries()) {
    const idx = party.players.findIndex(p => p.socketId === socketId);
    if (idx !== -1) {
      const [removed] = party.players.splice(idx, 1);

      // Transfer leadership if needed
      if (removed.isLeader && party.players.length > 0) {
        party.players[0].isLeader = true;
        party.leaderId = party.players[0].id;
      }

      // Clean up empty parties
      if (party.players.length === 0) {
        parties.delete(code);
      }

      return { party, removedId: removed.id };
    }
  }
  return null;
};

export const addMessage = (roomCode: string, msg: Omit<Message, 'id' | 'timestamp'>): Message | null => {
  const party = parties.get(roomCode);
  if (!party) return null;

  const message: Message = {
    ...msg,
    id: uuid(),
    timestamp: Date.now(),
  };

  party.messages = [...party.messages.slice(-99), message];
  return message;
};

export const setGameState = (roomCode: string, state: Party['gameState'], game?: GameType): void => {
  const party = parties.get(roomCode);
  if (!party) return;
  party.gameState = state;
  if (game !== undefined) party.currentGame = game;
};

export const updatePlayerScore = (roomCode: string, playerId: string, score: number): void => {
  const party = parties.get(roomCode);
  if (!party) return;
  const player = party.players.find(p => p.id === playerId);
  if (player) player.score = score;
};

export const getScores = (party: Party): Record<string, number> => {
  return Object.fromEntries(party.players.map(p => [p.id, p.score]));
};

export const computeLeaderboard = (party: Party) => {
  return [...party.players]
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({
      playerId: p.id,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      rank: idx + 1,
    }));
};


