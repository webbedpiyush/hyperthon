import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
import type { NextRequest } from "next/server";

export async function verifyAuth(request: Request): Promise<string | null> {
  try {
    // For API routes, get session from request
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    return session.user.id;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

// Alternative method for Next.js API routes
export async function getAuthenticatedUser(req?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error("Failed to get authenticated user:", error);
    return null;
  }
}

// Helper to get user info from database
export async function getUserInfo(userId: string) {
  try {
    const { prisma } = await import("./prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        totalScore: true,
        gamesPlayed: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

// Helper function to make authenticated requests (client-side)
export async function fetchWithAuth(url: string, options?: RequestInit) {
  try {
    // Get session token (this will work on client-side)
    const response = await fetch("/api/auth/session");
    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    const session = await response.json();
    if (!session?.user) {
      throw new Error("No valid session");
    }

    // Add session info to headers if needed
    const headers = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    // Make the request
    const result = await fetch(url, {
      ...options,
      headers,
    });

    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status}`);
    }

    return result;
  } catch (error) {
    console.error("fetchWithAuth error:", error);
    throw error;
  }
}
