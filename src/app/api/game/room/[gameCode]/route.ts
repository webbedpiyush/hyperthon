import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

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

    // Find game room with all players
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: {
        host: {
          select: { id: true, name: true, image: true },
        },
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

    // Check if the requesting user is part of this game
    const isPlayerInGame = gameRoom.players.some(
      (p: any) => p.userId === userId
    );
    if (!isPlayerInGame) {
      return NextResponse.json(
        { error: "You are not part of this game" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      gameRoom: {
        id: gameRoom.id,
        gameCode: gameRoom.gameCode,
        subject: gameRoom.subject,
        difficulty: gameRoom.difficulty,
        questionCount: gameRoom.questionCount,
        status: gameRoom.status,
        hostId: gameRoom.hostId,
        host: gameRoom.host,
        players: gameRoom.players,
        isHost: gameRoom.hostId === userId,
      },
    });
  } catch (error) {
    console.error("Error fetching game room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
