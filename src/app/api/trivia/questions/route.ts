import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";

// Mock trivia questions - in production, you'd fetch from a database
const TRIVIA_QUESTIONS = [
  {
    id: "1",
    question: "What is the capital of France?",
    correctAnswer: "Paris",
    wrongAnswers: ["London", "Berlin", "Madrid"],
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: "2",
    question: "Which planet is known as the Red Planet?",
    correctAnswer: "Mars",
    wrongAnswers: ["Venus", "Jupiter", "Saturn"],
    category: "Science",
    difficulty: "easy",
  },
  {
    id: "3",
    question: "Who painted the Mona Lisa?",
    correctAnswer: "Leonardo da Vinci",
    wrongAnswers: ["Michelangelo", "Picasso", "Van Gogh"],
    category: "Art",
    difficulty: "medium",
  },
  {
    id: "4",
    question: "What is the largest mammal in the world?",
    correctAnswer: "Blue Whale",
    wrongAnswers: ["African Elephant", "Giraffe", "Hippopotamus"],
    category: "Science",
    difficulty: "easy",
  },
  {
    id: "5",
    question: "In which year did World War II end?",
    correctAnswer: "1945",
    wrongAnswers: ["1944", "1946", "1943"],
    category: "History",
    difficulty: "medium",
  },
];

export async function GET(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "5");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    let filteredQuestions = [...TRIVIA_QUESTIONS];

    // Filter by category if specified
    if (category) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by difficulty if specified
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Shuffle and limit questions
    const shuffled = filteredQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    // Mix up the answers for each question
    const questionsWithShuffledAnswers = shuffled.map((q) => {
      const allAnswers = [q.correctAnswer, ...q.wrongAnswers];
      const shuffledAnswers = allAnswers.sort(() => 0.5 - Math.random());

      return {
        id: q.id,
        question: q.question,
        answers: shuffledAnswers,
        category: q.category,
        difficulty: q.difficulty,
      };
    });

    return NextResponse.json({
      questions: questionsWithShuffledAnswers,
      total: filteredQuestions.length,
    });
  } catch (error) {
    console.error("Error in /api/trivia/questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
