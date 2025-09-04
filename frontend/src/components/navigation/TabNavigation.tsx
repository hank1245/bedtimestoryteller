import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAudioGenerationStore } from "../../stores/audioStore";

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  color: ${(props) =>
    props.$active ? "var(--text-primary)" : "var(--text-secondary)"};
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.$active ? "#ffffff" : "transparent")};
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
`;

const InlineBadge = styled.button`
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 9999px;
  margin-left: auto; /* push to the right end of the tab row */
  cursor: pointer;
  align-self: center;
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

interface TabNavigationProps {
  activeTab: "all" | "folders";
  onTabChange: (tab: "all" | "folders") => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  const navigate = useNavigate();
  const {
    isGeneratingAudio,
    currentGeneratingStoryId,
    currentGeneratingStoryTitle,
    currentGeneratingVoiceLabel,
  } = useAudioGenerationStore();
  return (
    <TabContainer>
      <Tab $active={activeTab === "all"} onClick={() => onTabChange("all")}>
        All Stories
      </Tab>
      <Tab
        $active={activeTab === "folders"}
        onClick={() => onTabChange("folders")}
      >
        Folders
      </Tab>
      {isGeneratingAudio && (
        <InlineBadge
          title={`Generating ${currentGeneratingVoiceLabel || "voice"} for ${
            currentGeneratingStoryTitle || "a story"
          }`}
          onClick={() => {
            if (currentGeneratingStoryId) {
              navigate("/app/story", {
                state: { id: currentGeneratingStoryId },
              });
            }
          }}
        >
          Generating {currentGeneratingVoiceLabel || "voice"} for{" "}
          {currentGeneratingStoryTitle || "a story"}
        </InlineBadge>
      )}
    </TabContainer>
  );
}
