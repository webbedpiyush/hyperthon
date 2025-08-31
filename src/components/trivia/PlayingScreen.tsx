import {
  Clock,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/Button";
import { AlissaCharacter } from "./AlissaCharacter";

interface PlayingScreenProps {
  alissaMessage: string;
  alissaMood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
  gameRoom: {
    id: string;
    gameCode: string;
    currentQuestion: number;
    currentQuestionIndex?: number;
    totalQuestions?: number;
    questionCount?: number;
    subject?: string;
    difficulty?: string;
  };
  currentQuestion: {
    question: string;
    options: string[];
    correct: number;
    correctAnswer?: number;
    category?: string;
    difficulty?: string;
  };
  timeRemaining: number;
  selectedAnswer: number | null;
  showResult: boolean;
  answerResult: {
    correct: boolean;
    correctAnswer: number;
    explanation?: string;
    points?: number;
    nextQuestion?: {
      question: string;
      options: string[];
    };
  } | null;
  players: Array<{
    userId: string;
    user?: {
      name?: string;
      email?: string;
      image?: string;
    };
    score: number;
  }>;
  isHost: boolean;
  isSubmittingAnswer: boolean;
  onAnswerSubmit: (answerIndex: number | null, timeSpent: number) => void;
  onNextQuestion: () => void;
}

export function PlayingScreen({
  alissaMessage,
  alissaMood,
  gameRoom,
  currentQuestion,
  timeRemaining,
  selectedAnswer,
  showResult,
  answerResult,
  players,
  isHost,
  isSubmittingAnswer,
  onAnswerSubmit,
  onNextQuestion,
}: PlayingScreenProps) {
  if (!currentQuestion) {
    return (
      <div className="space-y-6 p-4">
        <AlissaCharacter
          currentMessage="Loading your first question... Get ready! 🤔"
          mood="excited"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <Clock className="w-8 h-8 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading question...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <AlissaCharacter
        currentMessage={
          showResult
            ? answerResult?.correct
              ? `Correct! You earned ${answerResult.points} points! 🎉`
              : "Oops! Not quite right. Better luck next time! 😅"
            : alissaMessage
        }
        mood={
          showResult
            ? answerResult?.correct
              ? "happy"
              : "disappointed"
            : alissaMood
        }
      />

      {/* Question Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Question {gameRoom?.currentQuestionIndex || 1} of{" "}
              {gameRoom?.totalQuestions || gameRoom?.questionCount}
            </span>
            <Badge variant={timeRemaining <= 5 ? "destructive" : "secondary"}>
              {timeRemaining}s
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Question Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {currentQuestion.category || gameRoom?.subject}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.difficulty || gameRoom?.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-center leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="grid gap-3">
            {currentQuestion.options?.map((option: string, index: number) => (
              <Button
                key={index}
                variant={
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? "default" // Correct answer
                      : selectedAnswer === index
                      ? "destructive" // Wrong answer that was selected
                      : "outline" // Other options
                    : selectedAnswer === index
                    ? "default" // Selected option
                    : "outline" // Unselected options
                }
                onClick={() =>
                  !showResult &&
                  !isSubmittingAnswer &&
                  onAnswerSubmit(index, 15 - timeRemaining)
                }
                disabled={
                  showResult || isSubmittingAnswer || timeRemaining === 0
                }
                className={`w-full p-4 h-auto text-left justify-start relative ${
                  showResult && index === currentQuestion.correctAnswer
                    ? "ring-2 ring-green-500 bg-green-100 text-green-900"
                    : showResult &&
                      selectedAnswer === index &&
                      index !== currentQuestion.correctAnswer
                    ? "ring-2 ring-red-500 bg-red-100 text-red-900"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      showResult && index === currentQuestion.correctAnswer
                        ? "bg-green-500 text-white"
                        : showResult &&
                          selectedAnswer === index &&
                          index !== currentQuestion.correctAnswer
                        ? "bg-red-500 text-white"
                        : selectedAnswer === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-sm sm:text-base leading-relaxed">
                    {option}
                  </span>
                  {showResult && index === currentQuestion.correctAnswer && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                  {showResult &&
                    selectedAnswer === index &&
                    index !== currentQuestion.correctAnswer && (
                      <span className="text-red-600 text-xl">✗</span>
                    )}
                </div>
              </Button>
            ))}
          </div>

          {/* Show result and explanation */}
          {showResult && answerResult && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div
                    className={`text-lg font-bold ${
                      answerResult.correct ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {answerResult.correct ? "🎉 Correct!" : "❌ Incorrect"}
                  </div>
                  {(answerResult.points ?? 0) > 0 && (
                    <div className="text-primary font-semibold">
                      +{answerResult.points} points
                    </div>
                  )}
                  {answerResult.explanation && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {answerResult.explanation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Question Button (Host Only) or Waiting Message */}
          {showResult && (
            <div className="pt-4">
              {isHost ? (
                <Button
                  onClick={onNextQuestion}
                  disabled={isSubmittingAnswer}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                  isLoading={isSubmittingAnswer}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {answerResult?.nextQuestion
                    ? "Next Question"
                    : "Show Results"}
                </Button>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <div className="animate-pulse">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players Scores */}
      {players && players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Current Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players
                .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                .map((player: any, index: number) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-muted-foreground text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">
                        {player.name}
                        {index === 0 && " 👑"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {player.score || 0} pts
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
