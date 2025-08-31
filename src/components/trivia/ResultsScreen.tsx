import {
  Medal,
  RotateCw,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/Button";
import { Separator } from "~/components/ui/separator";
import { AlissaCharacter } from "./AlissaCharacter";

interface ResultsScreenProps {
  alissaMessage: string;
  alissaMood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
  players: Array<{
    userId: string;
    user?: {
      name?: string;
      email?: string;
      image?: string;
    };
    score: number;
  }>;
  onPlayAgain: () => void;
  onBack: () => void;
}

export function ResultsScreen({
  alissaMessage,
  alissaMood,
  players,
  onPlayAgain,
  onBack,
}: ResultsScreenProps) {
  const finalScores = [...players].sort((a, b) => b.score - a.score);
  const winner = finalScores[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Game Results</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          <AlissaCharacter currentMessage={alissaMessage} mood={alissaMood} />

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Final Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Winner Card */}
              {winner && (
                <div className="p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg shadow-lg text-white">
                  <h3 className="text-lg font-semibold">🏆 WINNER 🏆</h3>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                      {winner.user?.name?.charAt(0) || winner.user?.email?.charAt(0) || "W"}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {winner.user?.name || winner.user?.email || "Winner"}
                      </p>
                      <p className="text-xl font-semibold">{winner.score} pts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Scores List */}
              <div className="space-y-3">
                {finalScores.map((player, index) => (
                  <div
                    key={player.userId}
                    className={`flex items-center justify-between p-3 rounded-md ${
                      index === 0 ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-muted-foreground text-white"
                        }`}
                      >
                        {index === 0 ? (
                          <Trophy className="w-5 h-5" />
                        ) : index === 1 ? (
                          <Medal className="w-5 h-5" />
                        ) : index === 2 ? (
                          <Medal className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {player.user?.name || "Player"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.user?.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {player.score} pts
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Play Again Button */}
              <Button
                onClick={onPlayAgain}
                className="w-full h-12 text-lg font-semibold shadow-custom"
                size="lg"
              >
                <RotateCw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
