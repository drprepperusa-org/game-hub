import type { Party, HippoTarget } from '../types';

interface HippoGameState {
  targets: HippoTarget[];
  tappedBy: Record<string, string>; // hippoId -> playerId
  spawnInterval: ReturnType<typeof setInterval> | null;
  gameTimer: ReturnType<typeof setTimeout> | null;
  duration: number;
  startTime: number;
}

const gameStates = new Map<string, HippoGameState>();

const generateTarget = (): HippoTarget => ({
  id: `h-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  x: Math.random() * 82 + 4,
  y: Math.random() * 72 + 8,
  isPopped: false,
  spawnTime: Date.now(),
});

export const startHippos = (
  roomCode: string,
  party: Party,
  onUpdate: (scores: Record<string, number>, state: Record<string, unknown>, timeRemaining: number) => void,
  onEnd: () => void
): HippoTarget[] => {
  const duration = 60000; // 60 seconds
  const state: HippoGameState = {
    targets: [],
    tappedBy: {},
    spawnInterval: null,
    gameTimer: null,
    duration,
    startTime: Date.now(),
  };

  // Reset scores
  party.players.forEach(p => { p.score = 0; });

  // Spawn hippos
  state.spawnInterval = setInterval(() => {
    // Spawn 1-2 hippos every 600ms
    const count = Math.random() > 0.6 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const target = generateTarget();
      state.targets.push(target);
      // Auto-remove after 3s
      setTimeout(() => {
        state.targets = state.targets.filter(t => t.id !== target.id);
      }, 3000);
    }

    const timeRemaining = Math.max(0, (duration - (Date.now() - state.startTime)) / 1000);
    const scores = Object.fromEntries(party.players.map(p => [p.id, p.score]));
    onUpdate(scores, { targets: state.targets, phase: 'playing' }, timeRemaining);
  }, 600);

  // End game after duration
  state.gameTimer = setTimeout(() => {
    stopHippos(roomCode);
    onEnd();
  }, duration);

  gameStates.set(roomCode, state);

  const initial: HippoTarget[] = [];
  return initial;
};

export const handleTap = (
  roomCode: string,
  hippoId: string,
  player: { id: string; score: number },
  onUpdate: (scores: Record<string, number>, state: Record<string, unknown>, timeRemaining: number) => void,
  party: Party
): boolean => {
  const state = gameStates.get(roomCode);
  if (!state) return false;

  const target = state.targets.find(t => t.id === hippoId && !t.isPopped);
  if (!target) return false;

  // Mark as popped
  target.isPopped = true;
  state.tappedBy[hippoId] = player.id;

  // Award points
  const partyPlayer = party.players.find(p => p.id === player.id);
  if (partyPlayer) {
    partyPlayer.score += 10;
  }

  // Remove from targets
  state.targets = state.targets.filter(t => t.id !== hippoId);

  const timeRemaining = Math.max(0, (state.duration - (Date.now() - state.startTime)) / 1000);
  const scores = Object.fromEntries(party.players.map(p => [p.id, p.score]));
  onUpdate(scores, { targets: state.targets, phase: 'playing' }, timeRemaining);

  return true;
};

export const stopHippos = (roomCode: string): void => {
  const state = gameStates.get(roomCode);
  if (!state) return;
  if (state.spawnInterval) clearInterval(state.spawnInterval);
  if (state.gameTimer) clearTimeout(state.gameTimer);
  gameStates.delete(roomCode);
};
