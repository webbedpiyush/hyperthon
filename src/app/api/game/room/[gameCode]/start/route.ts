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

    // Find game room
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: {
        host: {
          select: { id: true, name: true },
        },
        players: {
          include: {
            user: {
              select: { id: true, name: true },
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

    // Check if the user is the host
    if (gameRoom.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 }
      );
    }

    if (gameRoom.status !== "waiting") {
      return NextResponse.json(
        { error: "Game has already started or finished" },
        { status: 400 }
      );
    }

    // Start the game
    const updatedGameRoom = await prisma.gameRoom.update({
      where: { id: gameRoom.id },
      data: { status: "playing" },
      include: {
        host: {
          select: { id: true, name: true },
        },
        players: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Game started successfully!",
      gameRoom: {
        id: updatedGameRoom.id,
        gameCode: updatedGameRoom.gameCode,
        subject: updatedGameRoom.subject,
        difficulty: updatedGameRoom.difficulty,
        questionCount: updatedGameRoom.questionCount,
        status: updatedGameRoom.status,
        hostId: updatedGameRoom.hostId,
        host: updatedGameRoom.host,
        players: updatedGameRoom.players,
        isHost: updatedGameRoom.hostId === userId,
      },
    });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
