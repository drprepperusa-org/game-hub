import type { Party, Question } from '../types';

const QUESTIONS: Question[] = [
  { id: 'j1', text: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctIndex: 2, category: 'Geography', timeLimit: 30 },
  { id: 'j2', text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1, category: 'Science', timeLimit: 30 },
  { id: 'j3', text: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Raphael', 'Donatello', 'Leonardo da Vinci'], correctIndex: 3, category: 'Art', timeLimit: 30 },
  { id: 'j4', text: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3, category: 'Geography', timeLimit: 30 },
  { id: 'j5', text: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correctIndex: 1, category: 'Math', timeLimit: 30 },
  { id: 'j6', text: 'Which element has the symbol "O"?', options: ['Gold', 'Osmium', 'Oxygen', 'Oganesson'], correctIndex: 2, category: 'Science', timeLimit: 30 },
  { id: 'j7', text: 'What year did World War II end?', options: ['1943', '1944', '1945', '1946'], correctIndex: 2, category: 'History', timeLimit: 30 },
  { id: 'j8', text: 'What is the fastest land animal?', options: ['Lion', 'Cheetah', 'Leopard', 'Horse'], correctIndex: 1, category: 'Animals', timeLimit: 30 },
  { id: 'j9', text: 'Who wrote Romeo and Juliet?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Homer'], correctIndex: 1, category: 'Literature', timeLimit: 30 },
  { id: 'j10', text: 'What is 7 × 8?', options: ['54', '56', '58', '64'], correctIndex: 1, category: 'Math', timeLimit: 30 },
];

interface JeopardyState {
  questions: Question[];
  currentIndex: number;
  answers: Map<string, number>; // playerId -> answerIndex
  timer: ReturnType<typeof setTimeout> | null;
  questionTimer: ReturnType<typeof setTimeout> | null;
}

const gameStates = new Map<string, JeopardyState>();

export const startJeopardy = (
  roomCode: string,
  party: Party,
  onQuestion: (q: Question, idx: number, total: number, timeRemaining: number) => void,
  onQuestionEnd: (scores: Record<string, number>, correctIndex: number) => void,
  onEnd: () => void
): { totalQuestions: number } => {
  // Shuffle questions and pick 7
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 7);

  party.players.forEach(p => { p.score = 0; });

  const state: JeopardyState = {
    questions: shuffled,
    currentIndex: 0,
    answers: new Map(),
    timer: null,
    questionTimer: null,
  };

  gameStates.set(roomCode, state);

  const nextQuestion = () => {
    if (state.currentIndex >= state.questions.length) {
      stopJeopardy(roomCode);
      onEnd();
      return;
    }

    const q = state.questions[state.currentIndex];
    state.answers = new Map();

    onQuestion(q, state.currentIndex, shuffled.length, q.timeLimit);

    state.questionTimer = setTimeout(() => {
      // Award points
      state.answers.forEach((answerIdx, playerId) => {
        if (answerIdx === q.correctIndex) {
          const player = party.players.find(p => p.id === playerId);
          if (player) player.score += 100;
        }
      });

      const scores = Object.fromEntries(party.players.map(p => [p.id, p.score]));
      onQuestionEnd(scores, q.correctIndex);

      state.currentIndex++;

      // Wait 3s before next question
      state.timer = setTimeout(nextQuestion, 3000);
    }, q.timeLimit * 1000);
  };

  // Start first question after countdown
  state.timer = setTimeout(nextQuestion, 3000);

  return { totalQuestions: shuffled.length };
};

export const handleAnswer = (
  roomCode: string,
  playerId: string,
  answerIndex: number,
  party: Party,
  onAllAnswered: (scores: Record<string, number>, correctIndex: number) => void
): void => {
  const state = gameStates.get(roomCode);
  if (!state) return;

  // Only record first answer
  if (!state.answers.has(playerId)) {
    state.answers.set(playerId, answerIndex);
  }

  // Check if all players answered
  if (state.answers.size >= party.players.length) {
    const q = state.questions[state.currentIndex];
    if (state.questionTimer) clearTimeout(state.questionTimer);

    // Award points
    state.answers.forEach((idx, pid) => {
      if (idx === q.correctIndex) {
        const player = party.players.find(p => p.id === pid);
        if (player) player.score += 100;
      }
    });

    const scores = Object.fromEntries(party.players.map(p => [p.id, p.score]));
    onAllAnswered(scores, q.correctIndex);

    state.currentIndex++;
    // Advance will be handled by the onAllAnswered callback triggering a delayed next
  }
};

export const stopJeopardy = (roomCode: string): void => {
  const state = gameStates.get(roomCode);
  if (!state) return;
  if (state.timer) clearTimeout(state.timer);
  if (state.questionTimer) clearTimeout(state.questionTimer);
  gameStates.delete(roomCode);
};
