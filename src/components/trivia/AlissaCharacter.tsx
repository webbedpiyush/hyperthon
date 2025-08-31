import Image from "next/image";
import {
  Card,
  CardContent,
} from "~/components/ui/card";

interface AlissaCharacterProps {
    currentMessage: string;
    mood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
  }
  
  export function AlissaCharacter({ currentMessage, mood }: AlissaCharacterProps) {
    const moodStyles = {
      neutral: "transform scale-100 transition-transform duration-300",
      happy:
        "transform scale-105 transition-transform duration-300 drop-shadow-lg",
      disappointed:
        "transform scale-95 transition-transform duration-300 grayscale-50",
      excited:
        "transform scale-110 transition-transform duration-300 drop-shadow-2xl animate-bounce-subtle",
      smug: "transform scale-105 transition-transform duration-300",
    };
  
    const moodEmojis = {
      happy: "😊",
      disappointed: "😔",
      excited: "🤩",
      smug: "😏",
      neutral: "💭",
    };
  
    return (
      <div className="flex flex-col items-center space-y-4 p-4 sm:p-6">
        {/* Character Avatar */}
        <div className={`relative ${moodStyles[mood]}`}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-custom-lg border-4 border-primary/20">
            <Image
              src="/alissa-waifu.png"
              alt="Alissa AI Host"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>
  
          {/* Mood indicator */}
          <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-custom border-2 border-primary/30">
            <span className="text-sm sm:text-lg">{moodEmojis[mood]}</span>
          </div>
        </div>
  
        {/* Speech bubble */}
        <Card className="relative max-w-xs sm:max-w-md card-hover">
          <CardContent className="p-3 sm:p-4">
            <p className="text-sm sm:text-base text-center font-medium text-foreground leading-relaxed">
              {currentMessage}
            </p>
            {/* Speech bubble tail */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-border"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-card"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
