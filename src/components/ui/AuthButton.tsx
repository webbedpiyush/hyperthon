"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./Button";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {session.user?.name || session.user?.email}!
        </span>
        <Button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      <Button
        onClick={() => signIn("github")}
        className="bg-gray-800 hover:bg-gray-900">
        Sign in with GitHub
      </Button>
    </div>
  );
}
