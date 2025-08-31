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
        { error: "Game room not found. Check the code and try again!" },
        { status: 404 }
      );
    }

    if (gameRoom.status !== "waiting") {
      return NextResponse.json(
        { error: "This game has already started or finished!" },
        { status: 400 }
      );
    }

    // Check if user is already in the game
    const existingPlayer = gameRoom.players.find(
      (p: any) => p.userId === userId
    );
    if (existingPlayer) {
      return NextResponse.json({
        message: "You are already in this game!",
        gameRoom: {
          id: gameRoom.id,
          gameCode: gameRoom.gameCode,
          subject: gameRoom.subject,
          difficulty: gameRoom.difficulty,
          questionCount: gameRoom.questionCount,
          status: gameRoom.status,
          host: gameRoom.host.name,
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

    return NextResponse.json({
      message: "Successfully joined the game!",
      gameRoom: {
        id: updatedGameRoom!.id,
        gameCode: updatedGameRoom!.gameCode,
        subject: updatedGameRoom!.subject,
        difficulty: updatedGameRoom!.difficulty,
        questionCount: updatedGameRoom!.questionCount,
        status: updatedGameRoom!.status,
        host: updatedGameRoom!.host.name,
        players: updatedGameRoom!.players,
      },
    });
  } catch (error) {
    console.error("Error joining game room:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
