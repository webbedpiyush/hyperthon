import {
  Plus,
  Settings,
  Trophy,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/Button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { AlissaCharacter } from "~/components/trivia/AlissaCharacter";
import { GameSettings } from "~/components/trivia/types";

interface GameSetupProps {
  onStartGame: (
    settings: GameSettings,
    setLoading: (loading: boolean) => void
  ) => void;
  onJoinGame: (
    gameCode: string,
    setLoading: (loading: boolean) => void
  ) => void;
  alissaMessage: string;
  alissaMood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
}

export function GameSetup({
  onStartGame,
  onJoinGame,
  alissaMessage,
  alissaMood,
}: GameSetupProps) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [gameCode, setGameCode] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    subject: "",
    difficulty: "medium",
    questionCount: 10,
    isPrivate: false,
  });

  const difficulties = [
    {
      value: "easy",
      label: "Easy",
      desc: "Warm up questions",
      color: "bg-green-500",
    },
    {
      value: "medium",
      label: "Medium",
      desc: "Challenge accepted",
      color: "bg-yellow-500",
    },
    {
      value: "hard",
      label: "Hard",
      desc: "Prepare to suffer!",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-8 p-4">
      <AlissaCharacter currentMessage={alissaMessage} mood={alissaMood} />

      {/* Mode Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant={mode === "create" ? "default" : "outline"}
              onClick={() => setMode("create")}
              className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Create Game
            </Button>
            <Button
              variant={mode === "join" ? "default" : "outline"}
              onClick={() => setMode("join")}
              className="flex-1">
              <UserPlus className="w-4 h-4 mr-2" />
              Join Game
            </Button>
          </div>
        </CardContent>
      </Card>

      {mode === "join" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Join Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="gameCode" className="text-lg font-semibold">
                Enter Game Code
              </Label>
              <Input
                id="gameCode"
                placeholder="Enter 6-digit game code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="text-center text-2xl font-bold tracking-widest"
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground text-center">
                Ask your friend for the 6-digit game code
              </p>
            </div>

            <Button
              onClick={() => onJoinGame(gameCode, setIsJoiningGame)}
              disabled={gameCode.length !== 6 || isJoiningGame}
              className="w-full h-12 text-lg font-semibold shadow-custom"
              size="lg"
              isLoading={isJoiningGame}>
              <UserPlus className="w-5 h-5 mr-2" />
              {isJoiningGame ? "Joining Game..." : "Join Game"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Create Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Subject Selection */}
            <div className="space-y-3">
              <Label htmlFor="subject" className="text-lg font-semibold">
                Choose Your Subject
              </Label>
              <Input
                id="subject"
                placeholder="e.g., 'Ancient Rome' or '90s Rock Music'"
                value={settings.subject}
                onChange={(e) =>
                  setSettings({ ...settings, subject: e.target.value })
                }
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                Get creative! Alissa can generate questions on almost any topic.
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Select Difficulty</Label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((d) => (
                  <Button
                    key={d.value}
                    variant={
                      settings.difficulty === d.value ? "default" : "outline"
                    }
                    onClick={() =>
                      setSettings({
                        ...settings,
                        difficulty: d.value as "easy" | "medium" | "hard",
                      })
                    }
                    className="h-auto p-3 flex flex-col">
                    <span className="font-bold">{d.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.desc}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <Label htmlFor="questionCount" className="text-lg font-semibold">
                Number of Questions: {settings.questionCount}
              </Label>
              <Input
                id="questionCount"
                type="range"
                min="5"
                max="20"
                step="5"
                value={settings.questionCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    questionCount: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>

            <Button
              onClick={() => onStartGame(settings, setIsCreatingGame)}
              disabled={!settings.subject || isCreatingGame}
              className="w-full h-12 text-lg font-semibold shadow-custom"
              size="lg"
              isLoading={isCreatingGame}>
              <Trophy className="w-5 h-5 mr-2" />
              {isCreatingGame ? "Creating Game..." : "Create Game"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
