import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '@/stores/partyStore';
import { useGameStore } from '@/stores/gameStore';
import { useGameSocket } from '@/hooks/useGameSocket';
import ScoreBoard from '@/components/ScoreBoard/ScoreBoard';
import CountdownTimer from '@/components/CountdownTimer/CountdownTimer';
import styles from './GameJeopardy.module.scss';

const GameJeopardy: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode, players } = usePartyStore();
  const { currentQuestion, questionIndex, totalQuestions, playerScores, timeRemaining, gamePhase, myScore } = useGameStore();
  const { submitAnswer } = useGameSocket();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (!roomCode) navigate('/');
  }, [roomCode, navigate]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswered(false);
  }, [currentQuestion?.id]);

  const handleAnswer = useCallback((idx: number) => {
    if (answered || !currentQuestion) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    submitAnswer(idx, currentQuestion.id);
  }, [answered, currentQuestion, submitAnswer]);

  const getOptionClass = (idx: number) => {
    if (!answered) return styles.option;
    if (idx === selectedAnswer && idx === currentQuestion?.correctIndex) return `${styles.option} ${styles.correct}`;
    if (idx === selectedAnswer && idx !== currentQuestion?.correctIndex) return `${styles.option} ${styles.wrong}`;
    if (idx === currentQuestion?.correctIndex && answered) return `${styles.option} ${styles.correct}`;
    return styles.option;
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.gameTitle}>🎯 Jeopardy</div>
        <div className={styles.progress}>
          Q {questionIndex + 1}/{totalQuestions || '?'}
        </div>
        <CountdownTimer seconds={timeRemaining} totalSeconds={30} />
        <div className={styles.myScore}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreValue}>{myScore}</span>
        </div>
      </div>

      {gamePhase === 'countdown' && (
        <div className={styles.overlay}>
          <div className={styles.overlayText}>Get Ready!</div>
        </div>
      )}

      <div className={styles.content}>
        {currentQuestion ? (
          <>
            {currentQuestion.category && (
              <div className={styles.category}>{currentQuestion.category}</div>
            )}
            <div className={styles.question}>{currentQuestion.text}</div>
            <div className={styles.options}>
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={getOptionClass(idx)}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                >
                  <span className={styles.optionLabel}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className={styles.optionText}>{opt}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.waiting}>
            <div className={styles.waitingIcon}>🎯</div>
            <p>Waiting for question...</p>
            <div className={styles.spinner} />
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        <ScoreBoard scores={playerScores} players={players} myPlayerId={''} />
      </div>
    </div>
  );
};

export default GameJeopardy;
