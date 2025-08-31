"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "~/components/ui/Button";
import { AuthButton } from "~/components/ui/EnhancedAuthButton";
import { ALISSA_RESPONSES } from "~/lib/game-types";
import { generateAlissaGameResponse } from "~/lib/gemini-ai-new";

interface AlissaCharacterProps {
  currentMessage: string;
  mood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
}

function AlissaCharacter({ currentMessage, mood }: AlissaCharacterProps) {
  const moodStyles = {
    neutral: "transform scale-100 transition-transform duration-300",
    happy:
      "transform scale-105 transition-transform duration-300 drop-shadow-lg",
    disappointed:
      "transform scale-95 transition-transform duration-300 grayscale-50",
    excited:
      "transform scale-110 transition-transform duration-300 drop-shadow-2xl",
    smug: "transform scale-105 transition-transform duration-300",
  };

  return (
    <div className="relative flex flex-col items-center mb-6">
      {/* Character Avatar */}
      <div className={`relative ${moodStyles[mood]}`}>
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-white bg-gradient-to-br from-purple-50 to-pink-50">
          <Image
            src="/alissa-waifu.png"
            alt="Alissa AI Host"
            width={128}
            height={128}
            className="w-full h-full object-cover scale-110"
          />
        </div>

        {/* Mood indicator */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          {mood === "happy" && "😊"}
          {mood === "disappointed" && "😔"}
          {mood === "excited" && "🤩"}
          {mood === "smug" && "😏"}
          {mood === "neutral" && "😐"}
        </div>
      </div>

      {/* Speech bubble */}
      <div className="relative bg-white rounded-lg p-4 max-w-xs shadow-lg border-2 border-purple-200">
        <div className="text-sm text-gray-800 text-center font-medium">
          {currentMessage}
        </div>
        {/* Speech bubble tail */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-purple-200"></div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-white"></div>
        </div>
      </div>
    </div>
  );
}

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
  alissaMessage: string;
  alissaMood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
}

interface GameSettings {
  subject: string;
  difficulty: string;
  questionCount: number;
  isPrivate: boolean;
}

function GameSetup({ onStartGame, alissaMessage, alissaMood }: GameSetupProps) {
  const [settings, setSettings] = useState<GameSettings>({
    subject: "",
    difficulty: "medium",
    questionCount: 10,
    isPrivate: false,
  });

  const subjects = [
    "Science",
    "History",
    "Geography",
    "Sports",
    "Entertainment",
    "Technology",
    "Art",
    "Literature",
    "Music",
    "Random Mix",
  ];

  const difficulties = [
    { value: "easy", label: "Easy - Warm up questions" },
    { value: "medium", label: "Medium - Challenge accepted" },
    { value: "hard", label: "Hard - Prepare to suffer!" },
  ];

  return (
    <div className="space-y-6">
      <AlissaCharacter currentMessage={alissaMessage} mood={alissaMood} />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSettings((prev) => ({ ...prev, subject }))}
                className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                  settings.subject === subject
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-purple-300"
                }`}>
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Difficulty
          </label>
          <div className="space-y-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, difficulty: diff.value }))
                }
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  settings.difficulty === diff.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-purple-300"
                }`}>
                <div className="font-medium">
                  {diff.value.charAt(0).toUpperCase() + diff.value.slice(1)}
                </div>
                <div className="text-xs text-gray-500">
                  {diff.label.split(" - ")[1]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions: {settings.questionCount}
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={settings.questionCount}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                questionCount: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 questions</span>
            <span>20 questions</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="private"
            checked={settings.isPrivate}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, isPrivate: e.target.checked }))
            }
            className="w-4 h-4 text-purple-600"
          />
          <label htmlFor="private" className="text-sm text-gray-700">
            Private game (friends only)
          </label>
        </div>

        <Button
          onClick={() => onStartGame(settings)}
          disabled={!settings.subject}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          Create Game Room
        </Button>
      </div>
    </div>
  );
}

interface MultiplayerTriviaProps {
  title?: string;
}

export default function MultiplayerTrivia({
  title = "AI Trivia with Alissa",
}: MultiplayerTriviaProps) {
  const { data: session } = useSession();
  const [gameState, setGameState] = useState<
    "setup" | "waiting" | "playing" | "results"
  >("setup");
  const [gameRoom, setGameRoom] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [alissaMessage, setAlissaMessage] = useState(
    "Hi there! I'm Alissa, your AI trivia host! Ready for a brain challenge?"
  );
  const [alissaMood, setAlissaMood] = useState<
    "neutral" | "happy" | "disappointed" | "excited" | "smug"
  >("excited");

  // Initialize with dynamic greeting
  useEffect(() => {
    const initializeAlissa = async () => {
      try {
        const response = await generateAlissaGameResponse("setup");
        setAlissaMessage(response.message);
        setAlissaMood(response.mood);
      } catch (error) {
        // Keep default message if AI fails
        console.log("Using fallback greeting");
      }
    };

    if (session) {
      initializeAlissa();
    }
  }, [session]);

  const handleStartGame = async (settings: GameSettings) => {
    try {
      const response = await fetch("/api/game/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setGameRoom(data.gameRoom);
        setGameState("waiting");

        // Generate dynamic Alissa response for game creation
        try {
          const alissaResponse = await generateAlissaGameResponse("setup");
          setAlissaMessage(alissaResponse.message);
          setAlissaMood(alissaResponse.mood);
        } catch (error) {
          setAlissaMessage(
            "Game room created! Share the code with your friends or start playing solo!"
          );
          setAlissaMood("excited");
        }
      }
    } catch (error) {
      console.error("Failed to create game room:", error);
    }
  };

  const renderSetupScreen = () => (
    <GameSetup
      onStartGame={handleStartGame}
      alissaMessage={alissaMessage}
      alissaMood={alissaMood}
    />
  );

  const renderWaitingScreen = () => (
    <div className="space-y-6">
      <AlissaCharacter currentMessage={alissaMessage} mood={alissaMood} />

      <div className="text-center">
        <div className="text-3xl font-bold mb-2">{gameRoom?.gameCode}</div>
        <div className="text-sm text-gray-600 mb-4">
          Share this code with friends
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="text-sm font-medium text-gray-700">
            Game Settings:
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {gameRoom?.subject} • {gameRoom?.difficulty} •{" "}
            {gameRoom?.questionCount} questions
          </div>
        </div>

        <Button
          onClick={() => {
            setGameState("playing");
            setAlissaMessage("Let the games begin! Think you can outsmart me?");
            setAlissaMood("smug");
          }}
          className="w-full">
          Start Game
        </Button>
      </div>
    </div>
  );

  const renderPlayingScreen = () => (
    <div className="space-y-6">
      <AlissaCharacter
        currentMessage="Here we go! Let's see what you've got!"
        mood="excited"
      />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">Question 1 of 10</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: "10%" }}></div>
        </div>

        <div className="bg-white p-6 rounded-lg border mb-4">
          <div className="text-lg font-semibold mb-4">
            What is the capital of France?
          </div>

          <div className="space-y-3">
            {["Paris", "London", "Berlin", "Madrid"].map((answer, index) => (
              <Button
                key={index}
                className="w-full text-left justify-start p-4 bg-gray-50 hover:bg-purple-100 text-gray-800 border">
                {answer}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
            {timeRemaining}
          </div>
          <span className="text-sm text-gray-600">seconds remaining</span>
        </div>
      </div>
    </div>
  );

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-md mx-auto text-center space-y-6">
          <AlissaCharacter
            currentMessage="Hey there! You need to sign in first before we can play together!"
            mood="neutral"
          />

          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Welcome to AI Trivia!
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to start playing trivia games with Alissa and compete with
              friends!
            </p>
            <AuthButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-600">Play with your real friends</p>
      </div>

      {gameState === "setup" && renderSetupScreen()}
      {gameState === "waiting" && renderWaitingScreen()}
      {gameState === "playing" && renderPlayingScreen()}
    </div>
  );
}
