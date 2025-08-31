"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "~/components/ui/card";
import { Header } from "~/components/ui/Header";
import { AuthButton } from "~/components/ui/EnhancedAuthButton";
import { generateAlissaGameResponse } from "~/lib/gemini-ai-new";
import { useGameStream } from "~/hooks/useGameStream";
import {
  AlissaCharacter,
  GameSetup,
  WaitingScreen,
  PlayingScreen,
  ResultsScreen,
  GameSettings,
} from "~/components/trivia";

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
  const [isHost, setIsHost] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);

  // Real-time game stream
  const {
    gameRoom: streamGameRoom,
    isConnected,
    error: streamError,
    disconnect,
  } = useGameStream({
    gameCode: gameRoom?.gameCode,
    enabled: gameState === "waiting",
  });

  // Update game room from stream
  useEffect(() => {
    if (streamGameRoom) {
      const previousPlayerCount = gameRoom?.players?.length || 0;
      const newPlayerCount = streamGameRoom.players?.length || 0;

      // Check if new players joined (and we're the host)
      if (
        isHost &&
        newPlayerCount > previousPlayerCount &&
        previousPlayerCount > 0
      ) {
        const newPlayer = streamGameRoom.players[newPlayerCount - 1];
        const playerName = newPlayer?.user?.name || "Someone";
        setAlissaMessage(
          `${playerName} just joined the party! 🎉 Ready to start?`
        );
        setAlissaMood("excited");
      }

      // Check if game status changed to playing (for guests)
      if (streamGameRoom.status === "playing" && gameState === "waiting") {
        setGameState("playing");
        setAlissaMessage("The game has started! Let's see what you've got! 🔥");
        setAlissaMood("excited");
      }

      setGameRoom(streamGameRoom);
      setIsHost(streamGameRoom.isHost);
    }
  }, [streamGameRoom, gameState, isHost, gameRoom?.players?.length]);

  // Load current question when game starts
  useEffect(() => {
    const loadQuestion = async () => {
      if (gameState === "playing" && gameRoom?.gameCode) {
        try {
          const response = await fetch(
            `/api/game/${gameRoom.gameCode}/question`
          );
          if (response.ok) {
            const data = await response.json();

            if (data.gameCompleted) {
              setGameState("results");
              setAlissaMessage(
                "That's all folks! Time to see who's the trivia champion! 🏆"
              );
              setAlissaMood("excited");
            } else {
              setCurrentQuestion(data.question);
              setPlayers(data.players);
              setGameRoom((prev: any) => ({ ...prev, ...data.gameRoom }));
              setTimeRemaining(15); // Reset timer
              setSelectedAnswer(null);
              setShowResult(false);
              setAnswerResult(null);
            }
          }
        } catch (error) {
          console.error("Error loading question:", error);
        }
      }
    };

    loadQuestion();
  }, [gameState, gameRoom?.gameCode]);

  // Timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === "playing" && timeRemaining > 0 && !showResult) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !showResult && selectedAnswer === null) {
      // Time's up, auto-submit no answer
      handleAnswerSubmit(null, 15);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeRemaining, showResult, selectedAnswer]);

  // Fallback polling when stream is not connected
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === "waiting" && gameRoom?.gameCode && !isConnected) {
      console.log("🔄 Using fallback polling (stream not connected)");
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/game/room/${gameRoom.gameCode}`);
          if (response.ok) {
            const data = await response.json();
            setGameRoom(data.gameRoom);
            setIsHost(data.gameRoom.isHost);
          }
        } catch (error) {
          console.error("Error polling game room:", error);
        }
      }, 3000); // Slower polling as fallback
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState, gameRoom?.gameCode, isConnected]);

  // Initialize with dynamic greeting
  useEffect(() => {
    const initializeAlissa = async () => {
      try {
        const response = await generateAlissaGameResponse("setup");
        setAlissaMessage(response.message);
        setAlissaMood(response.mood);
      } catch (error) {
        console.log("Using fallback greeting");
      }
    };

    if (session) {
      initializeAlissa();
    }
  }, [session]);

  const handleStartGame = async (
    settings: GameSettings,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
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
        setIsHost(true); // Creator is always the host

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
      } else {
        const error = await response.json();
        setAlissaMessage(
          error.message || "Failed to create game room. Try again?"
        );
        setAlissaMood("disappointed");
      }
    } catch (error) {
      console.error("Failed to create game room:", error);
      setAlissaMessage(
        "Something went wrong creating the room. Check your connection?"
      );
      setAlissaMood("disappointed");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (
    gameCode: string,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/game/room/${gameCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGameRoom(data.gameRoom);
        setGameState("waiting");
        setIsHost(data.gameRoom.isHost || false); // Set based on API response

        try {
          const alissaResponse = await generateAlissaGameResponse("join");
          setAlissaMessage(alissaResponse.message);
          setAlissaMood(alissaResponse.mood);
        } catch (error) {
          const hostName = data.gameRoom.host?.name || "the host";
          setAlissaMessage(
            `Welcome to the party! You've joined ${hostName}'s game! 🎉`
          );
          setAlissaMood("excited");
        }
      } else {
        const error = await response.json();
        setAlissaMessage(
          error.message ||
            "Oops! That game code doesn't exist. Double-check it?"
        );
        setAlissaMood("disappointed");
      }
    } catch (error) {
      console.error("Failed to join game room:", error);
      setAlissaMessage(
        "Something went wrong trying to join the game. Try again?"
      );
      setAlissaMood("disappointed");
    } finally {
      setLoading(false);
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async (
    answerIndex: number | null,
    timeSpent: number
  ) => {
    if (isSubmittingAnswer || showResult) return;

    setSelectedAnswer(answerIndex);
    setIsSubmittingAnswer(true);

    try {
      const response = await fetch(`/api/game/${gameRoom.gameCode}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answerIndex,
          timeSpent: timeSpent || 15 - timeRemaining,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnswerResult(result);
        setShowResult(true);

        // Generate Alissa's response based on the result
        try {
          let alissaResponse;
          if (result.correct) {
            alissaResponse = await generateAlissaGameResponse("correct_answer");
            setAlissaMessage(
              alissaResponse.message || "Nice one! You got it right! 🎉"
            );
            setAlissaMood(alissaResponse.mood || "happy");
          } else {
            alissaResponse = await generateAlissaGameResponse("wrong_answer");
            setAlissaMessage(
              alissaResponse.message ||
                "Oops! Not quite right. Better luck next time! 😅"
            );
            setAlissaMood(alissaResponse.mood || "disappointed");
          }
        } catch (error) {
          // Fallback messages
          if (result.correct) {
            setAlissaMessage(
              "Correct! You earned " + result.points + " points! 🎉"
            );
            setAlissaMood("happy");
          } else {
            setAlissaMessage(
              "Wrong answer! Don't worry, there are more questions coming!"
            );
            setAlissaMood("disappointed");
          }
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setAlissaMessage(
        "Oops! There was a technical issue. Let's keep playing!"
      );
      setAlissaMood("disappointed");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handle moving to next question (host only)
  const handleNextQuestion = async () => {
    if (!isHost || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    try {
      const response = await fetch(`/api/game/${gameRoom.gameCode}/next`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();

        if (data.gameCompleted) {
          setGameState("results");
          setPlayers(data.finalScores);

          // Generate Alissa's final message
          try {
            const alissaResponse = await generateAlissaGameResponse(
              "game_completed"
            );
            setAlissaMessage(
              alissaResponse.message ||
                "Game over! Let's see who the trivia champion is! 🏆"
            );
            setAlissaMood(alissaResponse.mood || "excited");
          } catch (error) {
            setAlissaMessage(
              "That's a wrap! Time to crown our trivia champion! 🏆"
            );
            setAlissaMood("excited");
          }
        } else {
          // Load next question
          const questionResponse = await fetch(
            `/api/game/${gameRoom.gameCode}/question`
          );
          if (questionResponse.ok) {
            const questionData = await questionResponse.json();
            setCurrentQuestion(questionData.question);
            setPlayers(questionData.players);
            setGameRoom((prev: any) => ({ ...prev, ...questionData.gameRoom }));
            setTimeRemaining(15);
            setSelectedAnswer(null);
            setShowResult(false);
            setAnswerResult(null);

            setAlissaMessage("Next question coming up! Stay sharp! ⚡");
            setAlissaMood("excited");
          }
        }
      }
    } catch (error) {
      console.error("Error advancing question:", error);
      setAlissaMessage("Technical difficulties! Give me a moment...");
      setAlissaMood("disappointed");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleStartGameRoom = async () => {
    setIsStartingGame(true);
    try {
      const response = await fetch(
        `/api/game/room/${gameRoom.gameCode}/start`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setGameState("playing");
        setAlissaMessage(
          "Let the games begin! Think you can outsmart me?"
        );
        setAlissaMood("smug");
      } else {
        const error = await response.json();
        setAlissaMessage(
          error.message || "Couldn't start the game. Try again?"
        );
        setAlissaMood("disappointed");
      }
    } catch (error) {
      setAlissaMessage("Something went wrong starting the game!");
      setAlissaMood("disappointed");
    } finally {
      setIsStartingGame(false);
    }
  };

  const handlePlayAgain = () => {
    setGameState("setup");
    setGameRoom(null);
    setCurrentQuestion(null);
    setPlayers([]);
    setIsHost(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswerResult(null);
    setAlissaMessage(
      "Hi there! I'm Alissa, your AI trivia host! Ready for another brain challenge?"
    );
    setAlissaMood("excited");
  };

  const handleBack = () => {
    if (gameState === "waiting" || gameState === "playing") {
      disconnect(); // Disconnect stream
      setGameState("setup");
      setGameRoom(null);
      setIsHost(false);
    }
  };

  const getPageTitle = () => {
    switch (gameState) {
      case "waiting":
        return "Game Room";
      case "playing":
        return "Playing";
      case "results":
        return "Results";
      default:
        return "Setup Game";
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <Card className="w-full max-w-md card-hover">
            <CardContent className="pt-6">
              <AlissaCharacter
                currentMessage="Hey there! You need to sign in first before we can play together!"
                mood="neutral"
              />

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-center">
                  Welcome to AI Trivia!
                </h2>
                <p className="text-center text-muted-foreground text-sm sm:text-base">
                  Sign in to start playing trivia games with Alissa and compete
                  with friends!
                </p>
                <AuthButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results screen has its own header, so render it separately
  if (gameState === "results") {
    return (
      <ResultsScreen
        alissaMessage={alissaMessage}
        alissaMood={alissaMood}
        players={players}
        onPlayAgain={handlePlayAgain}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        showBack={gameState !== "setup"}
        onBack={handleBack}
        title={getPageTitle()}
      />

      <main className="flex-1 container mx-auto max-w-2xl py-4 px-4 sm:px-6">
        {gameState === "setup" && (
          <GameSetup
            onStartGame={handleStartGame}
            onJoinGame={handleJoinGame}
            alissaMessage={alissaMessage}
            alissaMood={alissaMood}
          />
        )}
        {gameState === "waiting" && (
          <WaitingScreen
            alissaMessage={alissaMessage}
            alissaMood={alissaMood}
            gameRoom={gameRoom}
            isHost={isHost}
            isConnected={isConnected}
            isStartingGame={isStartingGame}
            onStartGame={handleStartGameRoom}
          />
        )}
        {gameState === "playing" && (
          <PlayingScreen
            alissaMessage={alissaMessage}
            alissaMood={alissaMood}
            gameRoom={gameRoom}
            currentQuestion={currentQuestion}
            timeRemaining={timeRemaining}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            answerResult={answerResult}
            players={players}
            isHost={isHost}
            isSubmittingAnswer={isSubmittingAnswer}
            onAnswerSubmit={handleAnswerSubmit}
            onNextQuestion={handleNextQuestion}
          />
        )}
      </main>
    </div>
  );
}
