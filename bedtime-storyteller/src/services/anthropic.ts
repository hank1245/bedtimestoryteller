import Anthropic from "@anthropic-ai/sdk";
import { FormData } from "../types";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

function formatStoryResponse(rawText: string): string {
  const lines = rawText.split("\n").filter((line) => line.trim());

  if (lines.length === 0) return rawText;

  const title = lines[0].trim();
  const restOfStory = lines.slice(1).join(" ").trim();

  const sentences = restOfStory.split(/(?<=[.!?])\s+/);
  const formattedStory = sentences.join("\n");

  return `## ${title}\n\n${formattedStory}`;
}

export async function generateStoryWithClaude(
  formData: FormData
): Promise<string> {
  const prompt = `Write a bedtime story for a ${formData.age}-year-old ${
    formData.gender
  } child who loves ${formData.interests.join(", ")}. The story should be ${
    formData.style
  } in tone and naturally include a lesson about ${
    formData.lesson
  }. Keep it 300-500 words, age-appropriate, and perfect for bedtime. Make it soothing and engaging.

IMPORTANT: Do not include any introductory content in your response. Make the first line the title of the story and write the main story text after a line break.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return formatStoryResponse(content.text);
    } else {
      throw new Error("Unexpected response format from Claude API");
    }
  } catch (error) {
    console.error("Error generating story with Claude:", error);
    throw new Error("Failed to generate story. Please try again.");
  }
}
