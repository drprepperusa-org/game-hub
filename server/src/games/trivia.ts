import type { Party, Question } from '../types';

const TRIVIA_QUESTIONS: Question[] = [
  { id: 't1', text: 'What color is the sky on a clear day?', options: ['Green', 'Blue', 'Red', 'Yellow'], correctIndex: 1, category: 'Easy', timeLimit: 10 },
  { id: 't2', text: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], correctIndex: 1, category: 'Animals', timeLimit: 10 },
  { id: 't3', text: 'What is the boiling point of water (°C)?', options: ['90', '95', '100', '110'], correctIndex: 2, category: 'Science', timeLimit: 10 },
  { id: 't4', text: 'Which country invented pizza?', options: ['France', 'Greece', 'Spain', 'Italy'], correctIndex: 3, category: 'Food', timeLimit: 10 },
  { id: 't5', text: 'What is the square root of 64?', options: ['6', '7', '8', '9'], correctIndex: 2, category: 'Math', timeLimit: 10 },
  { id: 't6', text: 'How many colors are in a rainbow?', options: ['5', '6', '7', '8'], correctIndex: 2, category: 'Science', timeLimit: 10 },
  { id: 't7', text: 'Which is the largest continent?', options: ['Africa', 'Asia', 'North America', 'Europe'], correctIndex: 1, category: 'Geography', timeLimit: 10 },
  { id: 't8', text: 'What language do they speak in Brazil?', options: ['Spanish', 'Portuguese', 'French', 'English'], correctIndex: 1, category: 'Geography', timeLimit: 10 },
  { id: 't9', text: 'How many players are on a soccer team?', options: ['9', '10', '11', '12'], correctIndex: 2, category: 'Sports', timeLimit: 10 },
  { id: 't10', text: 'What is the hardest natural substance?', options: ['Iron', 'Gold', 'Diamond', 'Quartz'], correctIndex: 2, category: 'Science', timeLimit: 10 },
  { id: 't11', text: 'Who was the first man on the moon?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correctIndex: 1, category: 'History', timeLimit: 10 },
  { id: 't12', text: 'What does "www" stand for?', options: ['World Wide Web', 'World Wide Wire', 'Wide World Web', 'World Web Wire'], correctIndex: 0, category: 'Tech', timeLimit: 10 },
  { id: 't13', text: 'How many teeth does an adult human have?', options: ['28', '30', '32', '34'], correctIndex: 2, category: 'Biology', timeLimit: 10 },
  { id: 't14', text: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correctIndex: 2, category: 'Science', timeLimit: 10 },
  { id: 't15', text: 'What is the national animal of Australia?', options: ['Koala', 'Kangaroo', 'Crocodile', 'Emu'], correctIndex: 1, category: 'Animals', timeLimit: 10 },
];

interface TriviaState {
  questions: Question[];
  currentIndex: number;
  questionStartTime: number;
  answers: Map<string, { index: number; timeMs: number }>;
  timer: ReturnType<typeof setTimeout> | null;
  questionTimer: ReturnType<typeof setTimeout> | null;
}

const gameStates = new Map<string, TriviaState>();

export const startTrivia = (
  roomCode: string,
  party: Party,
  onQuestion: (q: Question, idx: number, total: number, timeRemaining: number) => void,
  onQuestionEnd: (scores: Record<string, number>, correctIndex: number) => void,
  onEnd: () => void
): { totalQuestions: number } => {
  const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  party.players.forEach(p => { p.score = 0; });

  const state: TriviaState = {
    questions: shuffled,
    currentIndex: 0,
    questionStartTime: 0,
    answers: new Map(),
    timer: null,
    questionTimer: null,
  };

  gameStates.set(roomCode, state);

  const nextQuestion = () => {
    if (state.currentIndex >= state.questions.length) {
      stopTrivia(roomCode);
      onEnd();
      return;
    }

    const q = state.questions[state.currentIndex];
    state.answers = new Map();
    state.questionStartTime = Date.now();

    onQuestion(q, state.currentIndex, shuffled.length, q.timeLimit);

    state.questionTimer = setTimeout(() => {
      processAnswers(state, q, party);
      const scores = Object.fromEntries(party.players.map(p => [p.id, p.score]));
      onQuestionEnd(scores, q.correctIndex);
      state.currentIndex++;
      state.timer = setTimeout(nextQuestion, 2500);
    }, q.timeLimit * 1000);
  };

  state.timer = setTimeout(nextQuestion, 3000);
  return { totalQuestions: shuffled.length };
};

const processAnswers = (state: TriviaState, q: Question, party: Party): void => {
  // Speed bonus: faster = more points (max 150, min 50 for correct)
  const answersArr = Array.from(state.answers.entries())
    .filter(([, a]) => a.index === q.correctIndex)
    .sort(([, a], [, b]) => a.timeMs - b.timeMs);

  answersArr.forEach(([playerId, answer], rank) => {
    const player = party.players.find(p => p.id === playerId);
    if (!player) return;
    // Speed scoring: 150 for fastest, decreasing by 10 per rank
    const points = Math.max(50, 150 - rank * 10);
    // Time bonus: faster = more (within 0-timeLimit seconds)
    const timeBonus = Math.max(0, Math.floor((1 - answer.timeMs / (q.timeLimit * 1000)) * 50));
    player.score += points + timeBonus;
  });
};

export const handleTriviaAnswer = (
  roomCode: string,
  playerId: string,
  answerIndex: number,
  timeMs: number,
  party: Party,
  onAllAnswered: (scores: Record<string, number>, correctIndex: number) => void
): void => {
  const state = gameStates.get(roomCode);
  if (!state || state.currentIndex >= state.questions.length) return;

  if (!state.answers.has(playerId)) {
    state.answers.set(playerId, { index: answerIndex, timeMs });
  }

  if (state.answers.size >= party.players.length) {
    const q = state.questions[state.currentIndex];
    if (state.questionTimer) clearTimeout(state.questionTimer);
    processAnswers(state, q, party);
    const scores = Object.fromEntries(party.players.map(p => [p.id, p.score]));
    onAllAnswered(scores, q.correctIndex);
    state.currentIndex++;
  }
};

export const stopTrivia = (roomCode: string): void => {
  const state = gameStates.get(roomCode);
  if (!state) return;
  if (state.timer) clearTimeout(state.timer);
  if (state.questionTimer) clearTimeout(state.questionTimer);
  gameStates.delete(roomCode);
};
