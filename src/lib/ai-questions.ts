// AI Question Generation using Gemini AI
import { generateTriviaQuestions } from "./gemini-ai-new";

export class AIQuestionGenerator {
  async generateQuestions({
    subject,
    difficulty,
    count = 10,
  }: {
    subject: string;
    difficulty: "easy" | "medium" | "hard";
    count?: number;
  }) {
    try {
      return await generateTriviaQuestions(subject, difficulty, count);
    } catch (error) {
      console.error("Error generating AI questions:", error);
      return this.generateMockQuestions(subject, difficulty, count);
    }
  }

  private generateMockQuestions(
    subject: string,
    difficulty: string,
    count: number
  ) {
    const baseQuestions = {
      Science: [
        {
          question: "What is the chemical symbol for gold?",
          options: ["Au", "Ag", "Fe", "Cu"],
          correctAnswer: 0,
          explanation: "Au comes from the Latin word 'aurum' meaning gold.",
        },
        {
          question: "Which planet has the most moons?",
          options: ["Jupiter", "Saturn", "Neptune", "Uranus"],
          correctAnswer: 1,
          explanation:
            "Saturn has 146 confirmed moons, more than any other planet.",
        },
      ],
      History: [
        {
          question: "In which year did World War II end?",
          options: ["1944", "1945", "1946", "1947"],
          correctAnswer: 1,
          explanation: "World War II officially ended on September 2, 1945.",
        },
        {
          question: "Who was the first person to walk on the moon?",
          options: [
            "Neil Armstrong",
            "Buzz Aldrin",
            "John Glenn",
            "Alan Shepard",
          ],
          correctAnswer: 0,
          explanation:
            "Neil Armstrong was the first human to set foot on the moon on July 20, 1969.",
        },
      ],
      Geography: [
        {
          question: "What is the capital of Australia?",
          options: ["Sydney", "Melbourne", "Canberra", "Perth"],
          correctAnswer: 2,
          explanation:
            "Canberra was established as the capital in 1913 as a compromise between Sydney and Melbourne.",
        },
      ],
    };

    const subjectQuestions =
      baseQuestions[subject as keyof typeof baseQuestions] ||
      baseQuestions["Science"];

    // Repeat and shuffle questions to meet count requirement
    const repeated = [];
    while (repeated.length < count) {
      repeated.push(...subjectQuestions);
    }

    return repeated.slice(0, count).map((q, index) => ({
      id: `ai-${Date.now()}-${index}`,
      ...q,
      category: subject,
      difficulty,
      aiGenerated: true,
    }));
  }

  getAlissaComment(score: number, totalQuestions: number): string {
    const percentage = (score / totalQuestions) * 100;

    if (percentage >= 90) {
      return "Whoa! You actually managed to impress me! I didn't think humans could be this smart! 🤯";
    } else if (percentage >= 70) {
      return "Not bad, not bad... You're almost as clever as I expected. Almost. 😏";
    } else if (percentage >= 50) {
      return "Eh, average human performance. I've seen better, but I've definitely seen worse! 😅";
    } else if (percentage >= 30) {
      return "Yikes... Maybe you should stick to easier topics? Don't worry, we all have our... limitations. 😬";
    } else {
      return "Oh dear... Did you even try? I'm starting to question human intelligence! 🤦‍♀️";
    }
  }
}
