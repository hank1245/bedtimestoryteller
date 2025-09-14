import styled from "styled-components";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioGenerationStore } from "../../stores/audioStore";

const TabContainer = styled.nav`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  align-items: flex-end;
`;

const TabsList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TabItem = styled.li`
  margin: 0;
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

  &:focus-visible {
    outline: 3px solid #7aa2ff;
    outline-offset: 2px;
    border-radius: 4px;
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

  &:focus-visible {
    outline: 3px solid #7aa2ff;
    outline-offset: 2px;
  }
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
  const allIds = { tab: "tab-all", panel: "panel-all" };
  const folderIds = { tab: "tab-folders", panel: "panel-folders" };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = activeTab === "all" ? "folders" : "all";
      onTabChange(next);
      // Move focus will naturally follow in React if refs are added; for simplicity, rely on tab order
    }
  };
  return (
    <TabContainer aria-label="Story sections">
      <TabsList role="tablist" aria-label="Story sections">
        <TabItem>
          <Tab
            $active={activeTab === "all"}
            id={allIds.tab}
            role="tab"
            aria-selected={activeTab === "all"}
            aria-controls={allIds.panel}
            tabIndex={activeTab === "all" ? 0 : -1}
            onKeyDown={onKeyDown}
            onClick={() => onTabChange("all")}
          >
            All Stories
          </Tab>
        </TabItem>
        <TabItem>
          <Tab
            $active={activeTab === "folders"}
            id={folderIds.tab}
            role="tab"
            aria-selected={activeTab === "folders"}
            aria-controls={folderIds.panel}
            tabIndex={activeTab === "folders" ? 0 : -1}
            onKeyDown={onKeyDown}
            onClick={() => onTabChange("folders")}
          >
            Folders
          </Tab>
        </TabItem>
      </TabsList>
      {isGeneratingAudio && (
        <InlineBadge
          title={`Generating ${currentGeneratingVoiceLabel || "voice"} for ${
            currentGeneratingStoryTitle || "a story"
          }`}
          aria-label={`View current generation: ${
            currentGeneratingVoiceLabel || "voice"
          } for ${currentGeneratingStoryTitle || "a story"}`}
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
