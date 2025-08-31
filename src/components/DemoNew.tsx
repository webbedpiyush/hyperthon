"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useChainId,
} from "wagmi";

import { ShareButton } from "./ui/Share";
import { AuthButton } from "./ui/AuthButton";

import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, degen, mainnet, optimism, unichain } from "wagmi/chains";
import { BaseError, UserRejectedRequestError } from "viem";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { USE_WALLET, APP_NAME } from "~/lib/constants";

export type Tab = "home" | "trivia" | "leaderboard" | "wallet";

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  totalScore: number;
  gamesPlayed: number;
}

interface TriviaQuestion {
  id: string;
  question: string;
  answers: string[];
  category: string;
  difficulty: string;
}

export default function Demo(
  { title }: { title?: string } = { title: "Trivia Game Demo" }
) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Trivia game state
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gameComplete, setGameComplete] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingTrivia, setLoadingTrivia] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Fetch user data when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/users");
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  // Start new trivia game
  const startTriviaGame = async () => {
    if (!session) return;

    setLoadingTrivia(true);
    try {
      const response = await fetch("/api/trivia/questions?count=5");
      const data = await response.json();
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setGameComplete(false);
      setGameResult(null);
      setActiveTab("trivia");
    } catch (error) {
      console.error("Failed to load trivia questions:", error);
    } finally {
      setLoadingTrivia(false);
    }
  };

  // Submit answer and move to next question
  const submitAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Game complete, submit all answers
      submitGameResults(newAnswers);
    }
  };

  // Submit final game results
  const submitGameResults = async (finalAnswers: Record<string, string>) => {
    try {
      const response = await fetch("/api/trivia/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: finalAnswers,
          category: "Mixed",
          difficulty: "mixed",
        }),
      });

      const result = await response.json();
      setGameResult(result);
      setGameComplete(true);

      // Refresh user data to show updated scores
      const userResponse = await fetch("/api/users");
      const userData = await userResponse.json();
      if (userData.user) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Failed to submit game results:", error);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/trivia/leaderboard");
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setActiveTab("leaderboard");
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
  } = useSwitchChain();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">Welcome to Trivia Game</h1>
        <p className="text-gray-600 mb-8 text-center">
          Sign in to start playing trivia and compete on the leaderboard!
        </p>
        <AuthButton />
      </div>
    );
  }

  const renderHomeTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {user?.totalScore || 0}
            </div>
            <div className="text-sm text-gray-600">Total Score</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user?.gamesPlayed || 0}
            </div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={startTriviaGame} isLoading={loadingTrivia}>
          {loadingTrivia ? "Loading..." : "Start New Game"}
        </Button>
        <Button
          onClick={loadLeaderboard}
          className="bg-orange-500 hover:bg-orange-600">
          View Leaderboard
        </Button>
      </div>
    </div>
  );

  const renderTriviaTab = () => {
    if (gameComplete && gameResult) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Game Complete! 🎉</h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {gameResult.score}%
              </div>
              <div className="text-lg text-gray-600">
                You got {gameResult.correctCount} out of{" "}
                {gameResult.totalQuestions} questions correct!
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Results:</h3>
            {gameResult.results?.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  result.isCorrect ? "bg-green-100" : "bg-red-100"
                }`}>
                <div className="text-sm">
                  <strong>Your answer:</strong> {result.userAnswer}
                </div>
                <div className="text-sm">
                  <strong>Correct answer:</strong> {result.correctAnswer}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={startTriviaGame}>Play Again</Button>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="text-center">
          <p>No questions loaded. Please start a new game.</p>
          <Button onClick={startTriviaGame} className="mt-4">
            Start New Game
          </Button>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-xs text-gray-500 mb-2">
            {currentQuestion.category} • {currentQuestion.difficulty}
          </div>
          <h3 className="text-xl font-semibold mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.answers.map((answer, index) => (
              <Button
                key={index}
                onClick={() => submitAnswer(answer)}
                className="w-full text-left justify-start p-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border">
                {answer}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Leaderboard 🏆</h2>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player: any, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-4 rounded-lg ${
              player.id === user?.id
                ? "bg-blue-50 border-2 border-blue-200"
                : "bg-gray-50"
            }`}>
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : index === 1
                    ? "bg-gray-300 text-gray-700"
                    : index === 2
                    ? "bg-orange-400 text-orange-900"
                    : "bg-gray-100 text-gray-600"
                }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-semibold">
                  {player.name || player.email}
                </div>
                <div className="text-xs text-gray-500">
                  {player.gamesPlayed} games played
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{player.totalScore}</div>
              <div className="text-xs text-gray-500">
                avg: {player.averageScore}
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center text-gray-500">
          <p>No players on the leaderboard yet.</p>
          <p className="text-sm mt-2">Be the first to play and set a score!</p>
        </div>
      )}
    </div>
  );

  const renderWalletTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Wallet Connection</h2>
        <p className="text-gray-600 mb-4">
          Connect your wallet for future Web3 features
        </p>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Connected Address:</div>
            <div className="font-mono text-sm">{truncateAddress(address!)}</div>
          </div>
          <Button
            onClick={() => disconnect()}
            className="bg-red-500 hover:bg-red-600">
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="bg-blue-500 hover:bg-blue-600">
              Connect {connector.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <AuthButton />
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: "home", label: "🏠 Home" },
            { id: "trivia", label: "🧠 Trivia" },
            { id: "leaderboard", label: "🏆 Board" },
            { id: "wallet", label: "💰 Wallet" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "home" && renderHomeTab()}
          {activeTab === "trivia" && renderTriviaTab()}
          {activeTab === "leaderboard" && renderLeaderboardTab()}
          {activeTab === "wallet" && renderWalletTab()}
        </div>
      </div>

      <Footer />
    </div>
  );
}
