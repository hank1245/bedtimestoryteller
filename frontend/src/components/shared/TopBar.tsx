import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "./Button";
import { useRoutePrefetch } from "../../hooks/useRoutePrefetch";
import { useAudioGenerationStore } from "../../stores/audioStore";

const TopBarContainer = styled.header<{ $variant: "single" | "split" }>`
  display: flex;
  justify-content: ${(props) =>
    props.$variant === "split" ? "space-between" : "flex-end"};
  align-items: center;
  margin-bottom: 24px;
  position: absolute;
  top: 20px;
  right: 20px;
  ${(props) => (props.$variant === "split" ? "left: 20px;" : "")}
  z-index: 2;

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    ${(props) => (props.$variant === "split" ? "left: 16px;" : "")}
  }
`;

const RightCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Generation badge is rendered near the Folders tab, not in the TopBar.

interface TopBarProps {
  variant?: "single" | "split";
  leftContent?: React.ReactNode;
  showSettings?: boolean;
}

export default function TopBar({
  variant = "single",
  leftContent,
  showSettings = true,
}: TopBarProps) {
  const navigate = useNavigate();
  const settingsPrefetch = useRoutePrefetch("settings");
  useAudioGenerationStore();

  return (
    <TopBarContainer $variant={variant} aria-label="Top bar">
      {leftContent}
      <RightCluster role="group" aria-label="Top bar actions">
        {showSettings && (
          <Button
            $secondary
            $small
            onClick={() => navigate("/app/settings")}
            onMouseEnter={settingsPrefetch.onMouseEnter}
            onFocus={settingsPrefetch.onFocus}
            onTouchStart={settingsPrefetch.onTouchStart}
            aria-label="Open settings"
          >
            Settings
          </Button>
        )}
        {/* generation badge moved to TabNavigation */}
      </RightCluster>
    </TopBarContainer>
  );
}
