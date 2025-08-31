import { NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

export async function GET(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get top players by total score
    const leaderboard = await prisma.user.findMany({
      where: {
        gamesPlayed: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalScore: true,
        gamesPlayed: true,
      },
      orderBy: {
        totalScore: "desc",
      },
      take: limit,
    });

    // Calculate average score for each player
    const leaderboardWithAverage = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user,
      averageScore:
        user.gamesPlayed > 0
          ? Math.round(user.totalScore / user.gamesPlayed)
          : 0,
    }));

    // Get current user's position
    const currentUserRank =
      (await prisma.user.count({
        where: {
          totalScore: {
            gt: await prisma.user
              .findUnique({
                where: { id: userId },
                select: { totalScore: true },
              })
              .then((u) => u?.totalScore || 0),
          },
        },
      })) + 1;

    return NextResponse.json({
      leaderboard: leaderboardWithAverage,
      currentUserRank,
    });
  } catch (error) {
    console.error("Error in /api/trivia/leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
