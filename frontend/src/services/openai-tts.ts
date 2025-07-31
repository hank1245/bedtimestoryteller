import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Voice configurations for OpenAI TTS
export const voices = {
  coral: {
    voiceId: "coral",
    name: "Coral (Warm Female)",
  },
  onyx: {
    voiceId: "onyx",
    name: "Onyx (Deep Male)",
  },
};

export interface TTSOptions {
  text: string;
  voice: keyof typeof voices;
  speed?: number; // 0.25 to 4.0
  instructions?: string; // Custom instructions for tone and style
}

export async function generateSpeechWithOpenAI({
  text,
  voice,
  speed = 0.97,
  instructions = "A tone for reading bedtime stories to children. Calm and very slowly, with emotion in each word, pausing for 1.5 second between sentences or paragraphs.",
}: TTSOptions): Promise<Blob> {
  try {

    // Using GPT-4o-mini-TTS for cost-effective, high-quality text-to-speech
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voices[voice].voiceId as any,
      input: text,
      speed: speed,
      response_format: "mp3",
      instructions: instructions,
    });

    const audioBlob = new Blob([await response.arrayBuffer()], {
      type: "audio/mpeg",
    });

    return audioBlob;
  } catch (error) {
    console.error("❌ Error generating speech with OpenAI:", error);
    throw new Error(
      `Failed to generate speech: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Clean text for better speech synthesis with bedtime story pacing
export function cleanTextForSpeech(text: string): string {
  return (
    text
      .replace(/##\s*/g, "") // Remove markdown headers
      .replace(/\*/g, "") // Remove asterisks
      .replace(/\n\n+/g, "\n\n") // Keep paragraph breaks
      .replace(/\.\s*\./g, ".") // Remove duplicate periods
      // Add natural pauses for calm bedtime reading
      .replace(/\. /g, "... ") // Add pause after sentences
      .replace(/! /g, "!... ") // Add pause after exclamations
      .replace(/\? /g, "?... ") // Add pause after questions
      .replace(/\n\n/g, "\n\n... ") // Add longer pause between paragraphs
      .replace(/,/g, ", ") // Ensure comma pauses
      .trim()
  );
}
