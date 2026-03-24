import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { usePartyStore } from '@/stores/partyStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useGameStore } from '@/stores/gameStore';
import type { Player, Message, GameType, GameResult } from '@/types';

export const usePartySocket = () => {
  const navigate = useNavigate();
  const { setPlayers, setGameState, setCurrentGame, setIsConnecting, setError, setCurrentPlayerId, setIsLeader, setRoomCode } = usePartyStore();
  const { username, avatar, setSocketId } = useAuthStore();
  const { addMessage } = useChatStore();
  const { setResults, setGamePhase, resetGame, setScores, setTimeRemaining, setCurrentQuestion, setQuestionIndex, setTotalQuestions, setHippoTargets, setMyScore, addScoreDelta } = useGameStore();

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      setSocketId(socket.id ?? null);
      setIsConnecting(false);
      setError(null);
    });

    socket.on('disconnect', () => {
      setSocketId(null);
      setIsConnecting(false);
    });

    socket.on('connect_error', () => {
      setError('Connection failed. Retrying...');
      setIsConnecting(false);
    });

    socket.on('player-joined', (data: { players: Player[]; roomCode: string }) => {
      setPlayers(data.players);
      setRoomCode(data.roomCode);
      const me = data.players.find((p) => p.id === socket.id);
      if (me) {
        setCurrentPlayerId(me.id);
        setIsLeader(me.isLeader);
      }
    });

    socket.on('player-left', (data: { players: Player[] }) => {
      setPlayers(data.players);
      const me = data.players.find((p) => p.id === socket.id);
      if (me) setIsLeader(me.isLeader);
    });

    socket.on('game-started', (data: { gameType: GameType; state: Record<string, unknown> }) => {
      setCurrentGame(data.gameType);
      setGameState('playing');
      resetGame();
      setGamePhase('countdown');

      if (data.gameType === 'hippos' && Array.isArray(data.state.targets)) {
        setHippoTargets(data.state.targets as import('@/types').HippoTarget[]);
      }
      if (data.gameType === 'jeopardy' || data.gameType === 'trivia') {
        if (data.state.totalQuestions) setTotalQuestions(data.state.totalQuestions as number);
      }

      navigate(`/game/${data.gameType}`);
    });

    socket.on('game-state-update', (data: { scores: Record<string, number>; state: Record<string, unknown>; timeRemaining?: number }) => {
      setScores(data.scores);
      if (data.timeRemaining !== undefined) setTimeRemaining(data.timeRemaining);
      if (socket.id && data.scores[socket.id] !== undefined) {
        const { myScore } = useGameStore.getState();
        const newScore = data.scores[socket.id];
        const delta = newScore - myScore;
        if (delta > 0) addScoreDelta(delta);
        setMyScore(newScore);
      }
      if (data.state.targets && Array.isArray(data.state.targets)) {
        setHippoTargets(data.state.targets as Parameters<typeof setHippoTargets>[0]);
      }
      if (data.state.question) {
        setCurrentQuestion(data.state.question as Parameters<typeof setCurrentQuestion>[0]);
      }
      if (data.state.questionIndex !== undefined) {
        setQuestionIndex(data.state.questionIndex as number);
      }
      if (data.state.phase) {
        setGamePhase(data.state.phase as Parameters<typeof setGamePhase>[0]);
      }
    });

    socket.on('game-ended', (data: { results: GameResult[]; leaderboard: GameResult[] }) => {
      setResults(data.results || data.leaderboard);
      setGameState('results');
      setGamePhase('ended');
      navigate('/results');
    });

    socket.on('message', (msg: Message) => {
      addMessage(msg);
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      setIsConnecting(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('game-state-update');
      socket.off('game-ended');
      socket.off('message');
      socket.off('error');
    };
  }, [navigate, setPlayers, setGameState, setCurrentGame, setIsConnecting, setError, setCurrentPlayerId, setIsLeader, setRoomCode, addMessage, setResults, setGamePhase, resetGame, setScores, setTimeRemaining, setCurrentQuestion, setQuestionIndex, setTotalQuestions, setHippoTargets, setMyScore, addScoreDelta, setSocketId]);

  const joinParty = useCallback((roomCode: string, uname: string, uavatar: string) => {
    const socket = getSocket();
    setIsConnecting(true);
    socket.emit('join-party', { roomCode, username: uname || username, avatar: uavatar || avatar });
  }, [username, avatar, setIsConnecting]);

  const leaveParty = useCallback(() => {
    const socket = getSocket();
    socket.emit('leave-party');
    disconnectSocket();
  }, []);

  const startGame = useCallback((gameType: GameType) => {
    const socket = getSocket();
    socket.emit('start-game', { gameType });
  }, []);

  const sendGameAction = useCallback((action: string, data: Record<string, unknown>) => {
    const socket = getSocket();
    socket.emit('game-action', { action, data });
  }, []);

  const sendMessage = useCallback((text: string) => {
    const socket = getSocket();
    const { username: uname, avatar: uavatar } = useAuthStore.getState();
    socket.emit('send-message', { text, username: uname, avatar: uavatar });
  }, []);

  const markReady = useCallback(() => {
    const socket = getSocket();
    socket.emit('ready');
  }, []);

  return { joinParty, leaveParty, startGame, sendGameAction, sendMessage, markReady };
};
