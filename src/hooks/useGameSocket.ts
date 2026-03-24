import { useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export const useGameSocket = () => {
  const tapHippo = useCallback((hippoId: string) => {
    getSocket().emit('game-action', { action: 'tap', data: { hippoId } });
  }, []);

  const submitAnswer = useCallback((answerIndex: number, questionId: string) => {
    getSocket().emit('game-action', { action: 'answer', data: { answerIndex, questionId } });
  }, []);

  const submitTriviaAnswer = useCallback((answerIndex: number, questionId: string, timeMs: number) => {
    getSocket().emit('game-action', { action: 'trivia-answer', data: { answerIndex, questionId, timeMs } });
  }, []);

  return { tapHippo, submitAnswer, submitTriviaAnswer };
};
