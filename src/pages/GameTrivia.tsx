import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '@/stores/partyStore';
import { useGameStore } from '@/stores/gameStore';
import { useGameSocket } from '@/hooks/useGameSocket';
import ScoreBoard from '@/components/ScoreBoard/ScoreBoard';
import CountdownTimer from '@/components/CountdownTimer/CountdownTimer';
import styles from './GameTrivia.module.scss';

const GameTrivia: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode, players } = usePartyStore();
  const { currentQuestion, questionIndex, totalQuestions, playerScores, timeRemaining, gamePhase, myScore } = useGameStore();
  const { submitTriviaAnswer } = useGameSocket();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!roomCode) navigate('/');
  }, [roomCode, navigate]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswered(false);
    questionStartRef.current = Date.now();
  }, [currentQuestion?.id]);

  const handleAnswer = useCallback((idx: number) => {
    if (answered || !currentQuestion) return;
    const timeMs = Date.now() - questionStartRef.current;
    setSelectedAnswer(idx);
    setAnswered(true);
    submitTriviaAnswer(idx, currentQuestion.id, timeMs);
  }, [answered, currentQuestion, submitTriviaAnswer]);

  const getOptionClass = (idx: number) => {
    if (!answered) return styles.option;
    if (idx === selectedAnswer && idx === currentQuestion?.correctIndex) return `${styles.option} ${styles.correct}`;
    if (idx === selectedAnswer) return `${styles.option} ${styles.wrong}`;
    if (answered && idx === currentQuestion?.correctIndex) return `${styles.option} ${styles.correctReveal}`;
    return `${styles.option} ${styles.disabled}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.gameTitle}>⚡ Trivia Battle</div>
        <div className={styles.progress}>
          <span>{questionIndex + 1}</span>/<span>{totalQuestions || '?'}</span>
        </div>
        <CountdownTimer seconds={timeRemaining} totalSeconds={10} warning={true} />
        <div className={styles.myScore}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreValue}>{myScore}</span>
        </div>
      </div>

      {gamePhase === 'countdown' && (
        <div className={styles.overlay}>
          <div className={styles.overlayTitle}>⚡ Trivia Battle</div>
          <div className={styles.overlayText}>Get Ready!</div>
          <p className={styles.overlayHint}>Answer faster for more points!</p>
        </div>
      )}

      <div className={styles.content}>
        {currentQuestion ? (
          <>
            <div className={styles.questionCard}>
              {currentQuestion.category && (
                <div className={styles.category}>{currentQuestion.category}</div>
              )}
              <div className={styles.question}>{currentQuestion.text}</div>
              {answered && (
                <div className={`${styles.answerResult} ${selectedAnswer === currentQuestion.correctIndex ? styles.correct : styles.wrong}`}>
                  {selectedAnswer === currentQuestion.correctIndex ? '✅ Correct!' : '❌ Wrong!'}
                </div>
              )}
            </div>
            <div className={styles.options}>
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={getOptionClass(idx)}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                >
                  <span className={styles.optionBadge}>{['A', 'B', 'C', 'D'][idx]}</span>
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.waiting}>
            <div className={styles.waitingIcon}>⚡</div>
            <p>Get ready for the next question!</p>
            <div className={styles.spinner} />
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        <ScoreBoard scores={playerScores} players={players} myPlayerId={''} compact={true} />
      </div>
    </div>
  );
};

export default GameTrivia;
