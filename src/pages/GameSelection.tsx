import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '@/stores/partyStore';
import { usePartySocket } from '@/hooks/usePartySocket';
import GameCard from '@/components/GameCard/GameCard';
import type { GameType } from '@/types';
import styles from './GameSelection.module.scss';

const GAMES = [
  {
    id: 'hippos' as GameType,
    icon: '🦛',
    name: 'Hippo Frenzy',
    description: 'Tap hippos as fast as you can! Speed wins.',
    color: '#44d9a0',
    players: '2-8',
    duration: '60s',
    difficulty: 'Easy',
  },
  {
    id: 'jeopardy' as GameType,
    icon: '🎯',
    name: 'Jeopardy Quiz',
    description: 'Answer trivia questions for points. Think fast!',
    color: '#6c63ff',
    players: '2-8',
    duration: '5-10 min',
    difficulty: 'Medium',
  },
  {
    id: 'trivia' as GameType,
    icon: '⚡',
    name: 'Trivia Battle',
    description: 'Rapid-fire questions! Speed + accuracy = more points.',
    color: '#ff6584',
    players: '2-8',
    duration: '3-5 min',
    difficulty: 'Hard',
  },
];

const GameSelection: React.FC = () => {
  const navigate = useNavigate();
  const { isLeader, roomCode, players } = usePartyStore();
  const { startGame } = usePartySocket();

  if (!roomCode) {
    navigate('/');
    return null;
  }

  if (!isLeader) {
    return (
      <div className={styles.container}>
        <div className={styles.waiting}>
          <div className={styles.waitingIcon}>🎮</div>
          <h2>Leader is picking a game...</h2>
          <p>Get ready to play!</p>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/party')}>← Back</button>
        <h1 className={styles.title}>Pick a Game</h1>
        <div className={styles.playerCount}>{players.length} players ready</div>
      </div>

      <div className={styles.subtitle}>You're the leader — choose wisely! 👑</div>

      <div className={styles.grid}>
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onSelect={() => startGame(game.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameSelection;
