import React from 'react';
import type { Player } from '@/types';
import styles from './ScoreBoard.module.scss';

interface Props {
  scores: Record<string, number>;
  players: Player[];
  myPlayerId: string;
  compact?: boolean;
}

const ScoreBoard: React.FC<Props> = ({ scores, players, myPlayerId, compact = false }) => {
  const sorted = players
    .map((p) => ({ ...p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div className={styles.compact}>
        {sorted.map((p, idx) => (
          <div key={p.id} className={`${styles.compactItem} ${p.id === myPlayerId ? styles.me : ''}`}>
            <span className={styles.compactRank}>#{idx + 1}</span>
            <span className={styles.compactAvatar}>{p.avatar}</span>
            <span className={styles.compactName}>{p.username}</span>
            <span className={styles.compactScore}>{p.score}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.scoreboard}>
      {sorted.map((p, idx) => (
        <div key={p.id} className={`${styles.item} ${p.id === myPlayerId ? styles.me : ''}`}>
          <span className={styles.rank}>#{idx + 1}</span>
          <span className={styles.avatar}>{p.avatar}</span>
          <span className={styles.name}>{p.username}</span>
          <div className={styles.scoreBar}>
            <div
              className={styles.scoreBarFill}
              style={{
                width: sorted[0]?.score > 0 ? `${(p.score / sorted[0].score) * 100}%` : '0%',
              }}
            />
          </div>
          <span className={styles.score}>{p.score}</span>
        </div>
      ))}
    </div>
  );
};

export default ScoreBoard;
