import React from 'react';
import styles from './CountdownTimer.module.scss';

interface Props {
  seconds: number;
  totalSeconds: number;
  warning?: boolean;
}

const CountdownTimer: React.FC<Props> = ({ seconds, totalSeconds, warning = false }) => {
  const pct = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
  const isUrgent = seconds <= 5 && seconds > 0;
  const isDanger = seconds <= 10 && warning;

  return (
    <div className={`${styles.timer} ${isUrgent ? styles.urgent : ''} ${isDanger ? styles.danger : ''}`}>
      <div className={styles.ring}>
        <svg viewBox="0 0 36 36" className={styles.svg}>
          <path
            className={styles.track}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
          />
          <path
            className={`${styles.fill} ${pct <= 25 ? styles.low : pct <= 50 ? styles.mid : ''}`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            strokeDasharray={`${pct}, 100`}
          />
        </svg>
        <span className={styles.value}>{Math.max(0, Math.ceil(seconds))}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
