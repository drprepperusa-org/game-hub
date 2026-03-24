import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createParty, getParty, addPlayer, removePlayer, addMessage,
  setGameState, getScores, computeLeaderboard, getPartyBySocketId
} from './parties';
import { startHippos, handleTap, stopHippos } from './games/hippos';
import { startJeopardy, handleAnswer as handleJeopardyAnswer, stopJeopardy } from './games/jeopardy';
import { startTrivia, handleTriviaAnswer, stopTrivia } from './games/trivia';
import { sanitizeMessage, broadcastMessage } from './chat';
import type { Player } from './types';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Health check
app.get('/', (_req, res) => res.json({ status: 'ok', game: 'Game Hub Server' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── join-party ──────────────────────────────────────────────
  socket.on('join-party', ({ roomCode, username, avatar }: { roomCode: string; username: string; avatar: string }) => {
    if (!roomCode || !username) {
      socket.emit('error', { message: 'Room code and username are required' });
      return;
    }

    const code = roomCode.trim().toUpperCase();
    const cleanName = username.trim().slice(0, 20);
    const cleanAvatar = avatar || '🎮';

    const player: Player = {
      id: socket.id,
      socketId: socket.id,
      username: cleanName,
      avatar: cleanAvatar,
      isLeader: false,
      score: 0,
      isReady: false,
    };

    let party = getParty(code);

    if (!party) {
      // Create new party
      player.isLeader = true;
      party = createParty(code, player);
      console.log(`[+] Party created: ${code} by ${cleanName}`);
    } else {
      // Join existing party
      if (party.players.length >= 8) {
        socket.emit('error', { message: 'Party is full (max 8 players)' });
        return;
      }
      if (party.gameState === 'playing') {
        socket.emit('error', { message: 'Game is already in progress' });
        return;
      }
      const result = addPlayer(code, player);
      if (!result) {
        socket.emit('error', { message: 'Failed to join party' });
        return;
      }
      party = result;
      console.log(`[+] ${cleanName} joined party ${code}`);
    }

    socket.join(code);

    // Broadcast updated player list
    io.to(code).emit('player-joined', {
      players: party.players,
      roomCode: code,
    });

    // Send chat history to new player
    if (party.messages.length > 0) {
      socket.emit('chat-history', party.messages);
    }
  });

  // ── leave-party ─────────────────────────────────────────────
  socket.on('leave-party', () => {
    handleDisconnect(socket.id);
  });

  // ── start-game ──────────────────────────────────────────────
  socket.on('start-game', ({ gameType }: { gameType: string }) => {
    const party = getPartyBySocketId(socket.id);
    if (!party) { socket.emit('error', { message: 'Not in a party' }); return; }

    const player = party.players.find(p => p.socketId === socket.id);
    if (!player?.isLeader) { socket.emit('error', { message: 'Only the leader can start games' }); return; }

    const validGames = ['hippos', 'jeopardy', 'trivia'];
    if (!validGames.includes(gameType)) { socket.emit('error', { message: 'Invalid game type' }); return; }

    const code = party.roomCode;
    setGameState(code, 'playing', gameType as 'hippos' | 'jeopardy' | 'trivia');

    console.log(`[GAME] Starting ${gameType} in ${code}`);

    if (gameType === 'hippos') {
      const targets = startHippos(
        code,
        party,
        (scores, state, timeRemaining) => {
          io.to(code).emit('game-state-update', { scores, state, timeRemaining });
        },
        () => {
          const leaderboard = computeLeaderboard(party);
          setGameState(code, 'results');
          io.to(code).emit('game-ended', { results: leaderboard, leaderboard });
        }
      );

      io.to(code).emit('game-started', {
        gameType,
        state: { targets, phase: 'countdown', totalQuestions: 0 }
      });

      // Start playing phase after countdown
      setTimeout(() => {
        io.to(code).emit('game-state-update', {
          scores: getScores(party),
          state: { phase: 'playing', targets: [] },
          timeRemaining: 60
        });
      }, 3000);

    } else if (gameType === 'jeopardy') {
      const { totalQuestions } = startJeopardy(
        code,
        party,
        (q, idx, total, timeRemaining) => {
          io.to(code).emit('game-state-update', {
            scores: getScores(party),
            state: { question: q, questionIndex: idx, phase: 'playing' },
            timeRemaining,
          });
        },
        (scores, correctIndex) => {
          io.to(code).emit('game-state-update', {
            scores,
            state: { phase: 'question-result', correctIndex },
            timeRemaining: 0,
          });
          // Next question delay handled in jeopardy.ts
        },
        () => {
          const leaderboard = computeLeaderboard(party);
          setGameState(code, 'results');
          io.to(code).emit('game-ended', { results: leaderboard, leaderboard });
        }
      );

      io.to(code).emit('game-started', {
        gameType,
        state: { phase: 'countdown', totalQuestions }
      });

    } else if (gameType === 'trivia') {
      const { totalQuestions } = startTrivia(
        code,
        party,
        (q, idx, total, timeRemaining) => {
          io.to(code).emit('game-state-update', {
            scores: getScores(party),
            state: { question: q, questionIndex: idx, phase: 'playing' },
            timeRemaining,
          });
        },
        (scores, correctIndex) => {
          io.to(code).emit('game-state-update', {
            scores,
            state: { phase: 'question-result', correctIndex },
            timeRemaining: 0,
          });
        },
        () => {
          const leaderboard = computeLeaderboard(party);
          setGameState(code, 'results');
          io.to(code).emit('game-ended', { results: leaderboard, leaderboard });
        }
      );

      io.to(code).emit('game-started', {
        gameType,
        state: { phase: 'countdown', totalQuestions }
      });
    }
  });

  // ── game-action ─────────────────────────────────────────────
  socket.on('game-action', ({ action, data }: { action: string; data: Record<string, unknown> }) => {
    const party = getPartyBySocketId(socket.id);
    if (!party) return;

    const player = party.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const code = party.roomCode;

    if (party.currentGame === 'hippos' && action === 'tap') {
      handleTap(
        code,
        data.hippoId as string,
        player,
        (scores, state, timeRemaining) => {
          io.to(code).emit('game-state-update', { scores, state, timeRemaining });
        },
        party
      );
    }

    if (party.currentGame === 'jeopardy' && action === 'answer') {
      handleJeopardyAnswer(
        code,
        player.id,
        data.answerIndex as number,
        party,
        (scores, correctIndex) => {
          io.to(code).emit('game-state-update', {
            scores,
            state: { phase: 'question-result', correctIndex },
            timeRemaining: 0,
          });
        }
      );
    }

    if (party.currentGame === 'trivia' && action === 'trivia-answer') {
      handleTriviaAnswer(
        code,
        player.id,
        data.answerIndex as number,
        data.timeMs as number,
        party,
        (scores, correctIndex) => {
          io.to(code).emit('game-state-update', {
            scores,
            state: { phase: 'question-result', correctIndex },
            timeRemaining: 0,
          });
        }
      );
    }
  });

  // ── send-message ─────────────────────────────────────────────
  socket.on('send-message', ({ text, username, avatar }: { text: string; username: string; avatar: string }) => {
    const party = getPartyBySocketId(socket.id);
    if (!party) return;

    const sanitized = sanitizeMessage(text);
    if (!sanitized) return;

    const message = addMessage(party.roomCode, {
      username: username || 'Unknown',
      text: sanitized,
      avatar: avatar || '🎮',
    });

    if (message) {
      broadcastMessage(io, party.roomCode, message);
    }
  });

  // ── ready ─────────────────────────────────────────────────────
  socket.on('ready', () => {
    const party = getPartyBySocketId(socket.id);
    if (!party) return;
    const player = party.players.find(p => p.socketId === socket.id);
    if (player) player.isReady = true;
    io.to(party.roomCode).emit('player-joined', { players: party.players, roomCode: party.roomCode });
  });

  // ── disconnect ─────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    handleDisconnect(socket.id);
  });
});

const handleDisconnect = (socketId: string) => {
  const result = removePlayer(socketId);
  if (!result) return;

  const { party, removedId } = result;

  // Stop any active games
  if (party.gameState === 'playing') {
    stopHippos(party.roomCode);
    stopJeopardy(party.roomCode);
    stopTrivia(party.roomCode);
  }

  io.to(party.roomCode).emit('player-left', {
    players: party.players,
    leftId: removedId,
  });
};

httpServer.listen(PORT, () => {
  console.log(`🎮 Game Hub Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0));
});
