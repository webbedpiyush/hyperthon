import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

// Store correct answers for validation (in production, use Redis or database)
const CORRECT_ANSWERS: { [key: string]: string } = {
  "1": "Paris",
  "2": "Mars",
  "3": "Leonardo da Vinci",
  "4": "Blue Whale",
  "5": "1945",
};

export async function POST(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers, category, difficulty } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const results = [];

    for (const [questionId, userAnswer] of Object.entries(answers)) {
      const correctAnswer = CORRECT_ANSWERS[questionId];
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId,
        userAnswer,
        correctAnswer,
        isCorrect,
      });
    }

    const totalQuestions = Object.keys(answers).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Save score to database
    await prisma.gameScore.create({
      data: {
        userId,
        score,
        category: category || "Mixed",
        difficulty: difficulty || "mixed",
      },
    });

    // Update user's total score and games played
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalScore: {
          increment: score,
        },
        gamesPlayed: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      score,
      correctCount,
      totalQuestions,
      percentage: score,
      results,
    });
  } catch (error) {
    console.error("Error in /api/trivia/submit-answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
