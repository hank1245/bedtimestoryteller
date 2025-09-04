import { memo } from "react";
import styled from "styled-components";
import {
  StoryItemContainer,
  StoryContent,
  StoryTags,
  HashTag,
} from "../shared/SharedStyles";
import { useRoutePrefetch } from "../../hooks/useRoutePrefetch";

interface Story {
  id: number;
  title: string;
  created_at: string;
  age?: string;
  length?: string;
  has_audio?: number | boolean; // provided by API list
}

interface StoryItemProps {
  story: Story;
  onClick: () => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  isRemoving?: boolean;
}

// Invisible placeholder that reserves the same space as the visible audio tag
const AudioBadgePlaceholder = styled(HashTag)`
  visibility: hidden;
`;

function StoryItem({
  story,
  onClick,
  showRemoveButton = false,
  onRemove,
  isRemoving = false,
}: StoryItemProps) {
  const prefetch = useRoutePrefetch("story");
  const hasAudio = Boolean(story.has_audio);
  return (
    <li
      style={{
        marginBottom: 24,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 8,
        padding: 22,
        cursor: "pointer",
        listStyle: "none",
      }}
      onClick={onClick}
      onMouseEnter={prefetch.onMouseEnter}
      onFocus={prefetch.onFocus}
      onTouchStart={prefetch.onTouchStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <StoryItemContainer>
        <StoryContent>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{story.title}</div>
          <div style={{ fontSize: 14, color: "#aaa", marginTop: 2 }}>
            {new Date(story.created_at).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </StoryContent>
        <StoryTags>
          {story.age && <HashTag $color="green">#Age {story.age}</HashTag>}
          {story.length && <HashTag $color="yellow">#{story.length}</HashTag>}
          {hasAudio ? (
            <HashTag $color="green">🔊 Audio</HashTag>
          ) : (
            <AudioBadgePlaceholder $color="green" aria-hidden>
              🔊 Audio
            </AudioBadgePlaceholder>
          )}
          {showRemoveButton && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={isRemoving}
              style={{
                background: "rgba(255, 82, 82, 0.1)",
                border: "1px solid rgba(255, 82, 82, 0.3)",
                color: "#ff5252",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                cursor: "pointer",
                marginTop: 4,
                transition: "all 0.3s ease",
              }}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          )}
        </StoryTags>
      </StoryItemContainer>
    </li>
  );
}

export default memo(StoryItem, (prev, next) => {
  return (
    prev.story.id === next.story.id &&
    prev.story.title === next.story.title &&
    prev.showRemoveButton === next.showRemoveButton &&
    prev.isRemoving === next.isRemoving
  );
});
