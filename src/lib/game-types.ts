// AI Character system for Alissa
export interface AlissaPersonality {
  greeting: string;
  encouragement: string;
  disappointment: string;
  victory: string;
  defeat: string;
}

export const ALISSA_RESPONSES: AlissaPersonality = {
  greeting:
    "Hi there! I'm Alissa, your AI trivia host! Ready to test your knowledge? I promise to be... mostly fair! 😈",
  encouragement:
    "Not bad! But I expected better from you... Let's see if you can surprise me! 💪",
  disappointment:
    "Seriously? That was the best you could do? I've seen goldfish with better memory! 🐟",
  victory:
    "Wow! You actually impressed me! I guess humans aren't completely hopeless after all! 🏆",
  defeat:
    "As expected... Don't worry, not everyone can match my superior intellect! Maybe try easier questions next time? 😏",
};

export interface TriviaQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
  category: string;
  difficulty: string;
}

export interface GameState {
  gameId: string;
  hostId: string;
  players: Player[];
  currentQuestion: number;
  questions: TriviaQuestion[];
  gameStatus: "waiting" | "active" | "finished";
  settings: GameSettings;
  timeRemaining?: number;
}

export interface Player {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  currentAnswer?: string;
  hasAnswered: boolean;
}

export interface GameSettings {
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  timePerQuestion: number; // seconds
  isPrivate: boolean;
}
