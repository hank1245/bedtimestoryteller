import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { StoryContainer } from "../components/story/StoryContainer";
import StoryLoading from "../components/StoryLoading";
import styled from "styled-components";
import { useState } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { useStory, useDeleteStory } from "../hooks/useStories";
import { useToast } from "../stores/toastStore";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useAudioGenerationStore } from "../stores/audioStore";
import ThreeBackground from "../components/background/ThreeBackground";

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
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-direction: column;
  gap: 12px;

  h1 {
    font-family: fantasy, serif;
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    flex: 1;
    text-align: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;

    h1 {
      font-size: 21px;
    }
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
  }
`;

const DeleteButton = styled(Button)`
  @media (max-width: 480px) {
    position: relative !important;
    top: 47px !important;
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

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const AudioControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const VoiceSelector = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 5px 9px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const AudioButton = styled.button<{ $isActive?: boolean }>`
  background: ${(props) =>
    props.$isActive ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)"};
  border: 1px solid
    ${(props) =>
      props.$isActive ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.2)"};
  border-radius: 8px;
  color: ${(props) =>
    props.$isActive ? "var(--accent-blue)" : "var(--text-primary)"};
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) =>
      props.$isActive ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.2)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const StoryText = styled.div<{ $fontSize: number }>`
  font-family: verdana, serif;
  font-size: ${(props) => props.$fontSize}px;
  line-height: 1.8;
  font-weight: 600;
  color: var(--text-primary);

  p {
    margin-bottom: 16px;
    text-align: justify;
  }

  /* 마크다운 헤더 스타일링 */
  h2 {
    font-family: verdana, serif;
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
    font-weight: 800;
    color: var(--accent-blue);
    margin-top: 8px;
    text-indent: 0;
  }

  /* 마지막 문단 스타일링 (보통 "The End" 등) */
  p:last-of-type,
  p.story-ending {
    text-align: center;
    font-weight: 800;
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

const Buttons = styled.div`
  display: flex;
  gap: 12px;
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: calc(100% - 40px);

  @media (max-width: 480px) {
  }
`;

export default function StoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast, addConfirmToast } = useToast();
  const storyId = location.state?.id;
  const [fontSize, setFontSize] = useState(16);
  const [isDeleting, setIsDeleting] = useState(false);

  // React Query로 스토리 데이터 가져오기
  const { data: storyData, isLoading } = useStory(storyId);
  const deleteStoryMutation = useDeleteStory();

  const title = storyData?.title || location.state?.title || "Untitled Story";
  const story =
    storyData?.story || location.state?.story || "No story available";

  // Voice configurations
  const voices = {
    coral: {
      voiceId: "coral",
      name: "Coral (Warm Female)",
    },
    onyx: {
      voiceId: "onyx",
      name: "Onyx (Deep Male)",
    },
  };

  // 새로운 오디오 훅 사용
  const {
    isPlaying,
    currentAudio,
    selectedVoice,
    generateAndPlayAudio,
    togglePlayPause,
    restartAudio,
    setSelectedVoice,
  } = useAudioPlayer({ voices, storyId, story });

  // 전역 오디오 생성 상태 (다른 페이지에서의 생성 상태 확인용)
  const { isGeneratingAudio: globalIsGenerating } = useAudioGenerationStore();

  const goToHome = () => {
    navigate("/app");
  };

  const createAnother = () => {
    navigate("/app/create");
  };

  const handleDelete = async () => {
    if (!storyId) return;

    addConfirmToast(
      "Are you sure you want to delete this story? This action cannot be undone.",
      async () => {
        // 확인 버튼 클릭 시 실행되는 함수
        setIsDeleting(true);
        try {
          await deleteStoryMutation.mutateAsync(storyId);
          addToast("success", "Story deleted successfully");
          navigate("/app", { replace: true });
        } catch (error) {
          console.error("Error deleting story:", error);
          addToast("error", "Error deleting story. Please try again.");
        } finally {
          setIsDeleting(false);
        }
      },
      () => {
        // 취소 버튼 클릭 시 실행되는 함수 (선택사항)
      }
    );
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
      <ThreeBackground
        intensity={0.3}
        moonPosition={[-10, 10, -15]}
        starsCount={80}
      />
      <Card>
        {isLoading ? (
          <StoryLoading subtext="Loading your magical story... Almost ready for reading and listening!" />
        ) : (
          <>
            {storyId && (
              <TopBar>
                <DeleteButton
                  $secondary
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    minHeight: "32px",
                    width: "auto",
                    margin: 0,
                    borderRadius: "8px",
                  }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </DeleteButton>
              </TopBar>
            )}
            <CompactHeader>
              <h1>{title}</h1>
              <ControlsContainer>
                <FontSizeControls>
                  <button onClick={decreaseFontSize}>A-</button>
                  <span>Font Size</span>
                  <button onClick={increaseFontSize}>A+</button>
                </FontSizeControls>
                <AudioControls>
                  <VoiceSelector
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                  >
                    <option value="coral">Coral (Warm Female)</option>
                    <option value="onyx">Onyx (Deep Male)</option>
                  </VoiceSelector>

                  {!currentAudio ? (
                    <AudioButton
                      onClick={async () => {
                        try {
                          await generateAndPlayAudio();
                        } catch (error) {
                          console.error(
                            "Error in generateAndPlayAudio:",
                            error
                          );
                          addToast(
                            "error",
                            "Failed to generate audio. Please try again."
                          );
                        }
                      }}
                      disabled={globalIsGenerating}
                    >
                      {globalIsGenerating ? <LoadingSpinner /> : <Volume2 />}
                    </AudioButton>
                  ) : (
                    <>
                      <AudioButton
                        onClick={togglePlayPause}
                        $isActive={isPlaying}
                      >
                        {isPlaying ? <Pause /> : <Play />}
                      </AudioButton>
                      <AudioButton onClick={restartAudio}>
                        <RotateCcw />
                      </AudioButton>
                    </>
                  )}
                </AudioControls>
              </ControlsContainer>
            </CompactHeader>
            <StoryContainer>
              <StoryText $fontSize={fontSize}>{formatStory(story)}</StoryText>
            </StoryContainer>
            <Buttons>
              <Button $secondary onClick={goToHome} style={{ flex: 1 }}>
                Back to Stories
              </Button>
              <Button $primary onClick={createAnother} style={{ flex: 1 }}>
                Create Another
              </Button>
            </Buttons>
          </>
        )}
      </Card>
    </StoryPageContainer>
  );
}
