import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

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

    // Get game room
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
    });

    if (!gameRoom) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Only host can advance questions
    if (gameRoom.hostId !== userId) {
      return NextResponse.json(
        { error: "Only host can advance questions" },
        { status: 403 }
      );
    }

    if (gameRoom.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in progress" },
        { status: 400 }
      );
    }

    const questions = JSON.parse(gameRoom.questions || "[]");
    const currentQuestionIndex = gameRoom.currentQuestion || 0;
    const nextQuestionIndex = currentQuestionIndex + 1;

    // Check if game is complete
    if (nextQuestionIndex >= questions.length) {
      // Game completed - update status
      await prisma.gameRoom.update({
        where: { id: gameRoom.id },
        data: { status: "completed" },
      });

      // Get final scores
      const finalScores = await prisma.gamePlayer.findMany({
        where: { gameId: gameRoom.id },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { score: "desc" },
      });

      return NextResponse.json({
        gameCompleted: true,
        finalScores: finalScores.map((player: any) => ({
          userId: player.userId,
          name: player.user.name,
          image: player.user.image,
          score: player.score || 0,
        })),
      });
    }

    // Move to next question
    await prisma.gameRoom.update({
      where: { id: gameRoom.id },
      data: { currentQuestion: nextQuestionIndex },
    });

    return NextResponse.json({
      success: true,
      currentQuestion: nextQuestionIndex + 1,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("Error advancing question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
