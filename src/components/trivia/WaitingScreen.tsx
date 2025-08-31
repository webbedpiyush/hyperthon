import {
  Clock,
  Trophy,
  Users,
  Wifi,
  WifiOff,
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

interface WaitingScreenProps {
  alissaMessage: string;
  alissaMood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
  gameRoom: {
    gameCode: string;
    subject?: string;
    difficulty?: string;
    questionCount?: number;
    hostId?: string;
    host?: {
      name?: string;
    };
    players?: Array<{
      userId?: string;
      user?: {
        name?: string;
        email?: string;
        image?: string;
      };
    }>;
  };
  isHost: boolean;
  isConnected: boolean;
  isStartingGame: boolean;
  onStartGame: () => void;
}

export function WaitingScreen({
  alissaMessage,
  alissaMood,
  gameRoom,
  isHost,
  isConnected,
  isStartingGame,
  onStartGame,
}: WaitingScreenProps) {
  return (
    <div className="space-y-6 p-4">
      <AlissaCharacter currentMessage={alissaMessage} mood={alissaMood} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {isHost ? "Your Game Room" : "Joined Game Room"}
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-1 text-xs">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-600">Syncing...</span>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {gameRoom?.gameCode}
            </div>
            <p className="text-muted-foreground">
              {isHost
                ? "Share this code with friends"
                : "Waiting for host to start..."}
            </p>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-foreground mb-2">
                Game Settings:
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{gameRoom?.subject}</Badge>
                <Badge variant="secondary">{gameRoom?.difficulty}</Badge>
                <Badge variant="secondary">
                  {gameRoom?.questionCount} questions
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          {gameRoom?.players && gameRoom.players.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-foreground mb-3">
                  Players ({gameRoom.players.length}):
                </div>
                <div className="space-y-2">
                  {gameRoom.players.map((player: {
                    id?: string;
                    userId?: string;
                    user?: {
                      name?: string;
                      email?: string;
                      image?: string;
                    };
                  }) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-2 bg-background/50 rounded-md"
                    >
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {player.user?.name?.charAt(0) ||
                          player.user?.email?.charAt(0) ||
                          "U"}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {player.user?.name || "Player"}
                          {player.userId === gameRoom.hostId && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Host
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Different buttons for host vs guest */}
          {isHost ? (
            <Button
              onClick={onStartGame}
              className="w-full h-12 text-lg font-semibold shadow-custom"
              size="lg"
              disabled={
                !gameRoom?.players ||
                gameRoom.players.length < 1 ||
                isStartingGame
              }
              isLoading={isStartingGame}
            >
              <Trophy className="w-5 h-5 mr-2" />
              {isStartingGame ? "Starting Game..." : "Start Game"}
            </Button>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <div className="animate-pulse">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Waiting for {gameRoom?.host?.name || "host"} to start the
                    game...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
