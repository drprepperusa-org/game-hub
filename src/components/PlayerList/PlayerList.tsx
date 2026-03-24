import React from 'react';
import type { Player } from '@/types';
import styles from './PlayerList.module.scss';

interface Props {
  players: Player[];
  currentPlayerId: string | null;
}

const PlayerList: React.FC<Props> = ({ players, currentPlayerId }) => {
  return (
    <div className={styles.list}>
      {players.length === 0 && (
        <div className={styles.empty}>Waiting for players to join...</div>
      )}
      {players.map((player, idx) => (
        <div
          key={player.id}
          className={`${styles.player} ${player.id === currentPlayerId ? styles.me : ''}`}
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className={styles.avatar}>{player.avatar}</div>
          <div className={styles.info}>
            <span className={styles.name}>
              {player.username}
              {player.id === currentPlayerId && <span className={styles.youTag}> (you)</span>}
            </span>
            {player.isLeader && <span className={styles.leaderBadge}>👑 Leader</span>}
          </div>
          <div className={styles.status}>
            <div className={`${styles.dot} ${styles.online}`} />
          </div>
        </div>
      ))}

      {/* Placeholder slots */}
      {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
        <div key={`empty-${i}`} className={styles.emptySlot}>
          <div className={styles.emptyAvatar}>?</div>
          <span className={styles.emptyName}>Waiting...</span>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
