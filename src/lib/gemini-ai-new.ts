import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function generateAlissaResponse(
  context: string,
  mood: "neutral" | "happy" | "disappointed" | "excited" | "smug"
): Promise<string> {
  // If no API key, use fallback responses
  if (!genAI || !API_KEY) {
    const fallbacks = {
      neutral:
        "Hey there! Ready to test your knowledge? Let's have some fun with trivia! 🎭",
      happy:
        "Yay! This is going to be so much fun! I can't wait to see how well you do! ✨",
      disappointed:
        "Oops! That wasn't quite right, but don't worry - you'll get the next one! 💪",
      excited:
        "WOW! You're absolutely crushing this! I'm so excited to keep going! 🎉",
      smug: "Hehe, I told you that was a tricky one! But you're keeping up pretty well~ 😏",
    };
    return fallbacks[mood];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const moodPrompts = {
      neutral:
        "Respond in a friendly, welcoming tone as Alissa, an AI trivia host.",
      happy:
        "Respond with excitement and joy as Alissa! Use enthusiastic language.",
      disappointed:
        "Respond with gentle disappointment as Alissa, but stay encouraging.",
      excited:
        "Respond with high energy and enthusiasm as Alissa! Show your excitement!",
      smug: "Respond with playful confidence as Alissa, being a bit cheeky about your knowledge.",
    };

    const prompt = `
You are Alissa, a cheerful and knowledgeable AI trivia host with an anime-inspired personality. You love hosting trivia games and helping people learn new things. 

Context: ${context}
Mood: ${mood}

${moodPrompts[mood]}

Keep your response under 50 words and make it engaging and personality-driven. Use casual, friendly language like you're talking to a friend.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating Alissa response:", error);

    // Fallback responses based on mood
    const fallbacks = {
      neutral:
        "Hey there! Ready to test your knowledge? Let's have some fun with trivia! 🎭",
      happy:
        "Yay! This is going to be so much fun! I can't wait to see how well you do! ✨",
      disappointed:
        "Oops! That wasn't quite right, but don't worry - you'll get the next one! 💪",
      excited:
        "WOW! You're absolutely crushing this! I'm so excited to keep going! 🎉",
      smug: "Hehe, I told you that was a tricky one! But you're keeping up pretty well~ 😏",
    };

    return fallbacks[mood];
  }
}

export async function generateTriviaQuestions(
  subject: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
) {
  // If no API key, use fallback questions
  if (!genAI || !API_KEY) {
    return [
      {
        id: `fallback_${Date.now()}_1`,
        question: `What is a basic fact about ${subject}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is a fallback question while we configure the AI.",
      },
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const difficultyDescriptions = {
      easy: "beginner-friendly with well-known facts",
      medium: "moderately challenging requiring some general knowledge",
      hard: "difficult questions that test deep knowledge",
    };

    const prompt = `
Generate ${count} ${difficulty} trivia questions about ${subject}. 
Make them ${difficultyDescriptions[difficulty]}.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "unique_id_1",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the answer"
  }
]

Requirements:
- Each question should have exactly 4 options
- correctAnswer should be the index (0-3) of the correct option
- Make questions engaging and educational
- Ensure answers are factually correct
- ID should be unique for each question
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean up the response to ensure it's valid JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Error generating trivia questions:", error);

    // Fallback questions
    return [
      {
        id: `fallback_${Date.now()}_1`,
        question: `What is a basic fact about ${subject}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation:
          "This is a fallback question while we fix the AI generation.",
      },
    ];
  }
}

export async function generateAlissaGameResponse(
  gameState: string,
  playerAnswer?: { isCorrect: boolean; timeLeft: number }
): Promise<{
  message: string;
  mood: "neutral" | "happy" | "disappointed" | "excited" | "smug";
}> {
  // If no API key, use fallback responses
  if (!genAI || !API_KEY) {
    const fallbackResponses = {
      setup: {
        message:
          "Alright! Let's set up an epic trivia battle! Pick your subject and let's see what you've got! 🎮",
        mood: "excited" as const,
      },
      waiting: {
        message:
          "Waiting for friends to join... or are you brave enough to face me solo? 😏",
        mood: "smug" as const,
      },
      correct: {
        message:
          "Nice one! You actually got that right! Color me impressed~ ✨",
        mood: "happy" as const,
      },
      incorrect: {
        message:
          "Oopsie! That's not quite right, but don't give up! You'll get the next one! 💪",
        mood: "disappointed" as const,
      },
    };

    if (playerAnswer) {
      return playerAnswer.isCorrect
        ? fallbackResponses.correct
        : fallbackResponses.incorrect;
    }
    return (
      fallbackResponses[gameState as keyof typeof fallbackResponses] ||
      fallbackResponses.setup
    );
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let context = "";
    let suggestedMood:
      | "neutral"
      | "happy"
      | "disappointed"
      | "excited"
      | "smug" = "neutral";

    if (gameState === "setup") {
      context = "Player is setting up a new trivia game";
      suggestedMood = "excited";
    } else if (gameState === "waiting") {
      context = "Waiting for more players to join the game";
      suggestedMood = "neutral";
    } else if (playerAnswer) {
      if (playerAnswer.isCorrect) {
        context = `Player answered correctly with ${playerAnswer.timeLeft} seconds left`;
        suggestedMood = playerAnswer.timeLeft > 8 ? "excited" : "happy";
      } else {
        context = "Player answered incorrectly";
        suggestedMood = "disappointed";
      }
    }

    const message = await generateAlissaResponse(context, suggestedMood);
    return { message, mood: suggestedMood };
  } catch (error) {
    console.error("Error generating game response:", error);
    return {
      message: "Let's keep the fun going! 🎮",
      mood: "neutral",
    };
  }
}
