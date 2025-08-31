import { NextRequest } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { gameCode: string } }
) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { gameCode } = params;

    // Verify user is part of this game
    const gameRoom = await prisma.gameRoom.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: { players: true },
    });

    if (!gameRoom || !gameRoom.players.some((p: any) => p.userId === userId)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Set up Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection
        controller.enqueue(
          `data: ${JSON.stringify({ type: "connected" })}\n\n`
        );

        // Poll for changes every 1 second
        const interval = setInterval(async () => {
          try {
            const updatedRoom = await prisma.gameRoom.findUnique({
              where: { gameCode: gameCode.toUpperCase() },
              include: {
                host: { select: { id: true, name: true, image: true } },
                players: {
                  include: {
                    user: { select: { id: true, name: true, image: true } },
                  },
                },
              },
            });

            if (updatedRoom) {
              const data = {
                type: "gameUpdate",
                gameRoom: {
                  id: updatedRoom.id,
                  gameCode: updatedRoom.gameCode,
                  subject: updatedRoom.subject,
                  difficulty: updatedRoom.difficulty,
                  questionCount: updatedRoom.questionCount,
                  status: updatedRoom.status,
                  hostId: updatedRoom.hostId,
                  host: updatedRoom.host,
                  players: updatedRoom.players,
                  isHost: updatedRoom.hostId === userId,
                },
              };

              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          } catch (error) {
            console.error("SSE polling error:", error);
          }
        }, 1000);

        // Cleanup on close
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("SSE setup error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
