"use client";

import dynamic from "next/dynamic";

// note: dynamic import updated to use new Responsive Multiplayer Trivia component
const ResponsiveMultiplayerTrivia = dynamic(
  () => import("~/components/ResponsiveMultiplayerTrivia"),
  {
    ssr: false,
  }
);

export default function App(
  { title }: { title?: string } = { title: "AI Trivia with Alissa" }
) {
  return <ResponsiveMultiplayerTrivia title={title} />;
}
