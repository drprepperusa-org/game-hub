import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '@/stores/partyStore';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { useGameSocket } from '@/hooks/useGameSocket';
import ScoreBoard from '@/components/ScoreBoard/ScoreBoard';
import CountdownTimer from '@/components/CountdownTimer/CountdownTimer';
import styles from './GameHippos.module.scss';

const GameHippos: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode, players } = usePartyStore();
  const { hippoTargets, playerScores, timeRemaining, gamePhase, myScore, lastScoreDelta, showScoreDelta } = useGameStore();
  const { socketId } = useAuthStore();
  const { tapHippo } = useGameSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const [localHippos, setLocalHippos] = React.useState<typeof hippoTargets>([]);

  useEffect(() => {
    if (!roomCode) navigate('/');
  }, [roomCode, navigate]);

  useEffect(() => {
    setLocalHippos(hippoTargets.filter(h => !h.isPopped));
  }, [hippoTargets]);

  // Spawn local demo hippos if server isn't providing them (for demo/offline mode)
  useEffect(() => {
    if (gamePhase === 'playing' && hippoTargets.length === 0) {
      const spawnInterval = setInterval(() => {
        const newHippo = {
          id: `hippo-${Date.now()}-${Math.random()}`,
          x: Math.random() * 80 + 5,
          y: Math.random() * 70 + 10,
          isPopped: false,
          spawnTime: Date.now(),
        };
        setLocalHippos(prev => [...prev.slice(-12), newHippo]);
        // Auto-remove after 3s
        setTimeout(() => {
          setLocalHippos(prev => prev.filter(h => h.id !== newHippo.id));
        }, 3000);
      }, 800);
      return () => clearInterval(spawnInterval);
    }
    return undefined;
  }, [gamePhase, hippoTargets.length]);

  const handleTap = useCallback((hippoId: string) => {
    tapHippo(hippoId);
    setLocalHippos(prev => prev.filter(h => h.id !== hippoId));
  }, [tapHippo]);

  const myRank = players.length > 0
    ? Object.entries(playerScores)
        .sort(([, a], [, b]) => b - a)
        .findIndex(([id]) => id === socketId) + 1
    : 1;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.gameTitle}>🦛 Hippo Frenzy</div>
        <CountdownTimer seconds={timeRemaining} totalSeconds={60} />
        <div className={styles.myScore}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreValue}>{myScore}</span>
          {showScoreDelta && (
            <span className={styles.scoreDelta}>+{lastScoreDelta}</span>
          )}
        </div>
      </div>

      <div className={styles.arena} ref={containerRef}>
        {gamePhase === 'countdown' && (
          <div className={styles.countdownOverlay}>
            <div className={styles.countdownText}>GET READY!</div>
          </div>
        )}

        {localHippos.map((hippo) => (
          <button
            key={hippo.id}
            className={styles.hippo}
            style={{ left: `${hippo.x}%`, top: `${hippo.y}%` }}
            onClick={() => handleTap(hippo.id)}
          >
            🦛
          </button>
        ))}

        {gamePhase === 'playing' && localHippos.length === 0 && (
          <div className={styles.emptyArena}>
            <span>Hippos incoming...</span>
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        <ScoreBoard scores={playerScores} players={players} myPlayerId={socketId || ''} />
      </div>
    </div>
  );
};

export default GameHippos;
