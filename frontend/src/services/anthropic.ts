import Anthropic from "@anthropic-ai/sdk";
import { FormData } from "../types";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Claude API 응답을 파싱해서 title과 story를 분리
function parseStoryResponse(rawText: string): { title: string; story: string } {
  const lines = rawText.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return { title: "Untitled Story", story: rawText };
  }

  // 첫 번째 줄을 제목으로 사용 (마크다운 헤더 제거)
  const title = lines[0].replace(/^#+\s*/, "").trim();

  // 나머지를 스토리로 사용
  const story = lines.slice(1).join("\n").trim();

  return { title, story };
}

export async function generateStoryWithClaude(
  formData: FormData
): Promise<{ title: string; story: string }> {
  const prompt = `Write a bedtime story for a ${formData.age}-year-old ${
    formData.gender
  } child who loves ${formData.interests.join(", ")}. The story should be ${
    formData.style
  } in tone and naturally include a lesson about ${
    formData.lesson
  }. Keep it 1000-1500 words, age-appropriate, and perfect for bedtime. Make it soothing and engaging.

IMPORTANT: 
- Make the first line ONLY the title of the story (without any markdown headers or extra formatting)
- Write the main story content starting from the second line
- Do not include any introductory content or explanations
- The response should be in this exact format:
[Title on first line]
[Empty line]
[Story content starting from third line]`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return parseStoryResponse(content.text);
    } else {
      throw new Error("Unexpected response format from Claude API");
    }
  } catch (error) {
    console.error("Error generating story with Claude:", error);
    throw new Error("Failed to generate story. Please try again.");
  }
}
