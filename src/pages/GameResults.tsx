import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import { usePartyStore } from '@/stores/partyStore';
import { useGameStore } from '@/stores/gameStore';
import Leaderboard from '@/components/Leaderboard/Leaderboard';
import styles from './GameResults.module.scss';

const GameResults: React.FC = () => {
  const navigate = useNavigate();
  const { isLeader, roomCode, players } = usePartyStore();
  const { results, currentGame, resetGame } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (!roomCode) navigate('/');
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize); };
  }, [roomCode, navigate]);

  const winner = results[0];

  const gameNames: Record<string, string> = {
    hippos: '🦛 Hippo Frenzy',
    jeopardy: '🎯 Jeopardy Quiz',
    trivia: '⚡ Trivia Battle',
  };

  return (
    <div className={styles.container}>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#6c63ff', '#ff6584', '#ffd700', '#44d9a0', '#4ecdc4', '#ff8c42']}
        />
      )}

      <div className={styles.header}>
        <div className={styles.gameLabel}>{currentGame ? gameNames[currentGame] : '🎮 Game'} — Results</div>
        {winner && (
          <div className={styles.winnerAnnounce}>
            <span className={styles.winnerAvatar}>{winner.avatar}</span>
            <div className={styles.winnerText}>
              <span className={styles.winnerName}>{winner.username}</span>
              <span className={styles.winnerTitle}>🏆 Winner!</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <Leaderboard results={results} players={players} />
      </div>

      <div className={styles.actions}>
        {isLeader && (
          <button className={styles.playAgainBtn} onClick={() => { resetGame(); navigate('/select-game'); }}>
            🎮 Play Again
          </button>
        )}
        <button className={styles.leaveBtn} onClick={() => {
          usePartyStore.getState().reset();
          resetGame();
          navigate('/');
        }}>
          🚪 Leave Party
        </button>
      </div>
    </div>
  );
};

export default GameResults;
