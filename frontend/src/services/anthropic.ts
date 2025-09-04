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
  let story = lines.slice(1).join("\n").trim();

  // 플레이스홀더 감지 및 경고 (개발 환경에서만)
  if (story.includes("[") && story.includes("]")) {
    console.warn(
      "Story contains placeholders - Claude API may need better prompting"
    );

    // 간단한 플레이스홀더 대체 (백업 처리)
    story = story
      .replace(/\[name\]/gi, "Alex")
      .replace(/\[character\]/gi, "Sam")
      .replace(/\[place\]/gi, "Dreamland")
      .replace(/\[location\]/gi, "the magical kingdom")
      .replace(/\[age\]/gi, "young")
      .replace(/\[child\]/gi, "little one");
  }

  // "The End"로 끝나지 않는다면 추가
  if (!story.toLowerCase().includes("the end")) {
    story += "\n\nThe End";
  }

  return { title, story };
}

export async function generateStoryWithClaude(
  formData: FormData
): Promise<{ title: string; story: string }> {
  // Map length to word count and max_tokens (천천히 읽기 위해 단어 수 조정)
  const lengthMapping = {
    "very-short": { words: "320-350", tokens: 500 }, // 3분 목표: 330단어 (110×3)
    short: { words: "530-570", tokens: 800 }, // 5분 목표: 550단어 (110×5)
    medium: { words: "750-790", tokens: 1100 }, // 7분 목표: 770단어 (110×7)
    long: { words: "1050-1100", tokens: 1600 }, // 10분 목표: 1100단어 (110×10)
  };

  const lengthConfig =
    lengthMapping[formData.length as keyof typeof lengthMapping] ||
    lengthMapping["medium"];

  const prompt = `Write a bedtime story for a ${formData.age}-year-old ${
    formData.gender
  } child who loves ${formData.interests.join(", ")}. The story should be ${
    formData.style
  } in tone and naturally include a lesson about ${
    formData.lesson
  }. Keep it around ${
    lengthConfig.words
  } words, age-appropriate, and perfect for bedtime. Make it soothing and engaging.

CRITICAL REQUIREMENTS:
- Create a COMPLETE story with NO placeholders, brackets, or [variables]
- Use specific names for all characters (e.g., "Luna", "Oliver", "Maya" - NOT "[name]" or "[character]")
- Use varied, specific locations with natural variety. Avoid reusing the same named setting across different stories. Do not use "Moonbeam Village" unless it is uniquely relevant; prefer fresh settings like seaside towns, snowy valleys, desert oases, cozy mountain cabins, river villages, enchanted orchards, lake islands, coastal lighthouses, or starlit observatories. Never use placeholders like "[place]" or "[location]".
- Fill in ALL details - the story must be 100% complete and ready to read
- Do NOT use any brackets [ ] or placeholders anywhere in the story
- Make the first line ONLY the title of the story (without any markdown headers or extra formatting)
- Start the story with a classic bedtime story opening like "Once upon a time" or "Long ago" or "In a faraway land"
- Write the main story content starting from the second line
- Do not include any introductory content or explanations
- The story MUST end with "The End" as the final line
- Target approximately ${lengthConfig.words} words for the story content

FORMAT:
[Title on first line]
[Empty line]
[Story opening paragraph starting with "Once upon a time" or similar]
[Story continues with complete details and specific names...]
[Final line: "The End"]

Remember: NO brackets, NO placeholders, NO [variables] - only complete, specific content!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: lengthConfig.tokens,
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
