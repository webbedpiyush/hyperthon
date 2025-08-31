import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

// Get current question for a game
export async function GET(
  request: Request,
  { params }: { params: { gameCode: string } }
) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameCode } = params;

    // Get game room with current question details
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: {
        players: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!gameRoom) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if user is part of this game
    const isPlayerInGame = gameRoom.players.some(
      (p: any) => p.userId === userId
    );
    if (!isPlayerInGame) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (gameRoom.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in progress" },
        { status: 400 }
      );
    }

    // Parse questions from JSON
    const questions = JSON.parse(gameRoom.questions || "[]");
    const currentQuestionIndex = gameRoom.currentQuestion || 0;

    if (currentQuestionIndex >= questions.length) {
      return NextResponse.json({
        gameCompleted: true,
        message: "All questions completed!",
      });
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Get player scores
    const playerScores = await prisma.gamePlayer.findMany({
      where: { gameId: gameRoom.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({
      gameRoom: {
        id: gameRoom.id,
        gameCode: gameRoom.gameCode,
        status: gameRoom.status,
        currentQuestionIndex: currentQuestionIndex + 1,
        totalQuestions: questions.length,
        timeRemaining: 15, // Default time per question
      },
      question: {
        id: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        // Don't send correct answer to client
        difficulty: currentQuestion.difficulty,
        category: currentQuestion.category,
      },
      players: playerScores.map((player: any) => ({
        id: player.id,
        userId: player.userId,
        name: player.user.name,
        image: player.user.image,
        score: player.score || 0,
      })),
      isHost: gameRoom.hostId === userId,
    });
  } catch (error) {
    console.error("Error fetching game question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Submit answer to current question
export async function POST(
  request: Request,
  { params }: { params: { gameCode: string } }
) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameCode } = params;
    const body = await request.json();
    const { answerIndex, timeSpent } = body;

    // Get game room
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
    });

    if (!gameRoom || gameRoom.status !== "playing") {
      return NextResponse.json(
        { error: "Game not available" },
        { status: 400 }
      );
    }

    // Get current question
    const questions = JSON.parse(gameRoom.questions || "[]");
    const currentQuestionIndex = gameRoom.currentQuestion || 0;
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
      return NextResponse.json(
        { error: "No current question" },
        { status: 400 }
      );
    }

    // Check if answer is correct
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Calculate points (higher score for faster answers)
    let points = 0;
    if (isCorrect) {
      const basePoints =
        gameRoom.difficulty === "hard"
          ? 15
          : gameRoom.difficulty === "medium"
          ? 10
          : 5;
      const timeBonus = Math.max(0, 15 - timeSpent); // Bonus for faster answers
      points = basePoints + timeBonus;
    }

    // Update player score
    await prisma.gamePlayer.updateMany({
      where: {
        gameId: gameRoom.id,
        userId: userId,
      },
      data: {
        score: {
          increment: points,
        },
      },
    });

    // Check if all players have answered (for multiplayer)
    // For now, we'll move to next question immediately after any player answers

    return NextResponse.json({
      correct: isCorrect,
      points: points,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      nextQuestion: currentQuestionIndex + 1 < questions.length,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
