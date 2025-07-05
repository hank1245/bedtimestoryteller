import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StoryContainer } from "../components/StoryContainer";
import styled from "styled-components";
import { useState } from "react";

const StoryPageContainer = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;

  @media (max-width: 480px) {
    max-width: none;
    margin: 0;
    padding: 0;
  }
`;

const CompactHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h1 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    flex: 1;
    text-align: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;

    h1 {
      font-size: 18px;
    }
  }
`;

const FontSizeControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    padding: 5px 9px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  span {
    font-size: 14px;
    color: var(--text-secondary);
    min-width: 60px;
    text-align: center;
  }
`;

const StoryText = styled.div<{ $fontSize: number }>`
  font-size: ${(props) => props.$fontSize}px;
  line-height: 1.8;
  color: var(--text-primary);

  p {
    margin-bottom: 16px;
    text-align: justify;
  }

  /* 마크다운 헤더 스타일링 */
  h2 {
    font-size: ${(props) => props.$fontSize + 4}px;
    font-weight: 600;
    color: var(--accent-blue);
    margin-bottom: 20px;
    text-align: center;
    background: linear-gradient(
      135deg,
      var(--accent-blue),
      var(--accent-purple)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* 첫 번째 문단 스타일링 (보통 "Once upon a time" 등) */
  p:first-of-type,
  p.story-beginning {
    font-size: ${(props) => props.$fontSize + 2}px;
    font-weight: 500;
    color: var(--accent-blue);
    margin-top: 8px;
    text-indent: 0;
  }

  /* 마지막 문단 스타일링 (보통 "The End" 등) */
  p:last-of-type,
  p.story-ending {
    text-align: center;
    font-weight: 500;
    color: var(--accent-blue);
    margin-top: 24px;
    font-size: ${(props) => props.$fontSize}px;
    font-style: italic;
  }

  /* 일반 문단에 들여쓰기 추가 */
  p:not(.story-beginning):not(.story-ending):not(:first-of-type):not(
      :last-of-type
    ) {
    text-indent: 20px;
  }

  @media (max-width: 480px) {
    font-size: ${(props) => Math.max(props.$fontSize - 1, 12)}px;
    line-height: 1.7;

    h2 {
      font-size: ${(props) => props.$fontSize + 2}px;
    }

    p:first-of-type,
    p.story-beginning {
      font-size: ${(props) => props.$fontSize + 1}px;
    }
  }
`;

export default function StoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.state?.title || "Untitled Story";
  const story = location.state?.story || "No story available";
  const [fontSize, setFontSize] = useState(16);

  const goToHome = () => {
    navigate("/");
  };

  const createAnother = () => {
    navigate("/create");
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 22));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  // 스토리 텍스트를 문단으로 나누는 함수
  const formatStory = (storyText: string) => {
    // 줄바꿈을 기준으로 나누고 빈 줄은 제거
    const lines = storyText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let firstStoryParagraph = -1; // 첫 번째 스토리 문단 인덱스

    return lines.map((line, index) => {
      // 마크다운 헤더 처리 (## 제거하고 h2로 변환)
      if (line.startsWith("##")) {
        const headerText = line.replace(/^#+\s*/, "");
        return <h2 key={index}>{headerText}</h2>;
      }

      // "The End" 처리
      if (
        line.includes("The End") ||
        line.includes("🌙") ||
        line.includes("✨")
      ) {
        return (
          <p key={index} className="story-ending">
            {line}
          </p>
        );
      }

      // 첫 번째 스토리 문단 찾기 (헤더가 아닌 첫 번째 문단)
      if (firstStoryParagraph === -1) {
        firstStoryParagraph = index;
        return (
          <p key={index} className="story-beginning">
            {line}
          </p>
        );
      }

      // 일반 문단 처리
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <StoryPageContainer>
      <Card>
        <CompactHeader>
          <h1>{title}</h1>
          <FontSizeControls>
            <button onClick={decreaseFontSize}>A-</button>
            <span>Font Size</span>
            <button onClick={increaseFontSize}>A+</button>
          </FontSizeControls>
        </CompactHeader>
        <StoryContainer>
          <StoryText $fontSize={fontSize}>{formatStory(story)}</StoryText>
        </StoryContainer>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button $secondary onClick={goToHome} style={{ flex: 1 }}>
            Back to Stories
          </Button>
          <Button $primary onClick={createAnother} style={{ flex: 1 }}>
            Create Another
          </Button>
        </div>
      </Card>
    </StoryPageContainer>
  );
}
