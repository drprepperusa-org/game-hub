import React from 'react';
import type { GameType } from '@/types';
import styles from './GameCard.module.scss';

interface GameInfo {
  id: GameType;
  icon: string;
  name: string;
  description: string;
  color: string;
  players: string;
  duration: string;
  difficulty: string;
}

interface Props {
  game: GameInfo;
  onSelect: () => void;
}

const GameCard: React.FC<Props> = ({ game, onSelect }) => {
  return (
    <button
      className={styles.card}
      onClick={onSelect}
      style={{ '--accent-color': game.color } as React.CSSProperties}
    >
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{game.icon}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{game.name}</h3>
        <p className={styles.desc}>{game.description}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>👥 {game.players}</span>
          <span className={styles.metaItem}>⏱ {game.duration}</span>
          <span className={`${styles.metaItem} ${styles.difficulty}`}>{game.difficulty}</span>
        </div>
      </div>
      <div className={styles.playButton}>Play →</div>
    </button>
  );
};

export default GameCard;
