import React from 'react';
import type { GameResult, Player } from '@/types';
import styles from './Leaderboard.module.scss';

interface Props {
  results: GameResult[];
  players: Player[];
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

const Leaderboard: React.FC<Props> = ({ results, players }) => {
  const sorted = [...results].sort((a, b) => a.rank - b.rank);

  const getAvatar = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.avatar || '🎮';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🏆 Final Standings</h2>
      <div className={styles.list}>
        {sorted.map((result, idx) => (
          <div
            key={result.playerId}
            className={`${styles.row} ${idx === 0 ? styles.winner : ''}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={styles.rank}>
              {RANK_ICONS[idx] ?? `#${idx + 1}`}
            </div>
            <div className={styles.avatar}>{result.avatar || getAvatar(result.playerId)}</div>
            <div className={styles.info}>
              <span className={styles.name}>{result.username}</span>
            </div>
            <div className={styles.score}>
              <span className={styles.scoreValue}>{result.score.toLocaleString()}</span>
              <span className={styles.scoreLabel}>pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
