import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";
import { AIQuestionGenerator } from "~/lib/ai-questions";

// Generate unique 6-digit game code
function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      difficulty,
      questionCount = 10,
      timePerQuestion = 15,
    } = body;

    if (!subject || !difficulty) {
      return NextResponse.json(
        { error: "Subject and difficulty are required" },
        { status: 400 }
      );
    }

    // Generate AI questions
    const aiGenerator = new AIQuestionGenerator();
    const questions = await aiGenerator.generateQuestions({
      subject,
      difficulty,
      count: questionCount,
    });

    // Create game room
    let gameCode = generateGameCode();

    // Ensure unique game code
    let existingRoom = await prisma.gameRoom.findUnique({
      where: { gameCode },
    });

    while (existingRoom) {
      gameCode = generateGameCode();
      existingRoom = await prisma.gameRoom.findUnique({
        where: { gameCode },
      });
    }

    const gameRoom = await prisma.gameRoom.create({
      data: {
        hostId: userId,
        gameCode,
        subject,
        difficulty,
        questionCount,
        timePerQuestion,
        questions: JSON.stringify(questions),
        status: "waiting",
      },
    });

    // Add host as first player
    await prisma.gamePlayer.create({
      data: {
        gameId: gameRoom.id,
        userId: userId,
      },
    });

    return NextResponse.json({
      gameRoom: {
        id: gameRoom.id,
        gameCode: gameRoom.gameCode,
        subject: gameRoom.subject,
        difficulty: gameRoom.difficulty,
        status: gameRoom.status,
      },
    });
  } catch (error) {
    console.error("Error creating game room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Join existing game room
export async function PUT(request: Request) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gameCode } = body;

    if (!gameCode) {
      return NextResponse.json(
        { error: "Game code is required" },
        { status: 400 }
      );
    }

    // Find game room
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: {
        players: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!gameRoom) {
      return NextResponse.json(
        { error: "Game room not found" },
        { status: 404 }
      );
    }

    if (gameRoom.status !== "waiting") {
      return NextResponse.json(
        { error: "Game has already started or finished" },
        { status: 400 }
      );
    }

    // Check if user is already in the game
    const existingPlayer = gameRoom.players.find((p) => p.userId === userId);
    if (existingPlayer) {
      return NextResponse.json({
        message: "Already in game",
        gameRoom: {
          id: gameRoom.id,
          gameCode: gameRoom.gameCode,
          players: gameRoom.players,
        },
      });
    }

    // Add player to game
    await prisma.gamePlayer.create({
      data: {
        gameId: gameRoom.id,
        userId: userId,
      },
    });

    // Fetch updated game room
    const updatedGameRoom = await prisma.gameRoom.findUnique({
      where: { id: gameRoom.id },
      include: {
        players: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Joined game successfully",
      gameRoom: updatedGameRoom,
    });
  } catch (error) {
    console.error("Error joining game room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
