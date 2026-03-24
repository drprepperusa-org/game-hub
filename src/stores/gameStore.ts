import { create } from 'zustand';
import type { GameType, GameResult, Question, HippoTarget } from '@/types';

interface GameState {
  currentGame: GameType | null;
  isPlaying: boolean;
  timeRemaining: number;
  playerScores: Record<string, number>;
  results: GameResult[];
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  hippoTargets: HippoTarget[];
  myScore: number;
  lastScoreDelta: number;
  showScoreDelta: boolean;
  gamePhase: 'waiting' | 'countdown' | 'playing' | 'question-result' | 'ended';

  setCurrentGame: (game: GameType | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setTimeRemaining: (time: number) => void;
  updateScore: (playerId: string, score: number) => void;
  setScores: (scores: Record<string, number>) => void;
  setResults: (results: GameResult[]) => void;
  setCurrentQuestion: (q: Question | null) => void;
  setQuestionIndex: (idx: number) => void;
  setTotalQuestions: (total: number) => void;
  setHippoTargets: (targets: HippoTarget[]) => void;
  removeHippoTarget: (id: string) => void;
  setMyScore: (score: number) => void;
  addScoreDelta: (delta: number) => void;
  setGamePhase: (phase: GameState['gamePhase']) => void;
  resetGame: () => void;
}

const initialGameState = {
  currentGame: null,
  isPlaying: false,
  timeRemaining: 0,
  playerScores: {},
  results: [],
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  hippoTargets: [],
  myScore: 0,
  lastScoreDelta: 0,
  showScoreDelta: false,
  gamePhase: 'waiting' as const,
};

export const useGameStore = create<GameState>()((set) => ({
  ...initialGameState,

  setCurrentGame: (game) => set({ currentGame: game }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),

  updateScore: (playerId, score) =>
    set((state) => ({
      playerScores: { ...state.playerScores, [playerId]: score },
    })),

  setScores: (scores) => set({ playerScores: scores }),

  setResults: (results) => set({ results }),

  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  setQuestionIndex: (idx) => set({ questionIndex: idx }),
  setTotalQuestions: (total) => set({ totalQuestions: total }),
  setHippoTargets: (targets) => set({ hippoTargets: targets }),

  removeHippoTarget: (id) =>
    set((state) => ({
      hippoTargets: state.hippoTargets.map((t) =>
        t.id === id ? { ...t, isPopped: true } : t
      ),
    })),

  setMyScore: (score) => set({ myScore: score }),

  addScoreDelta: (delta) => {
    set({ lastScoreDelta: delta, showScoreDelta: true });
    setTimeout(() => set({ showScoreDelta: false }), 1500);
  },

  setGamePhase: (phase) => set({ gamePhase: phase }),
  resetGame: () => set({ ...initialGameState }),
}));
