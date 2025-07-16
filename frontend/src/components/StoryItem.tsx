import {
  StoryItemContainer,
  StoryContent,
  StoryTags,
  HashTag,
} from "./shared/SharedStyles";

interface Story {
  id: number;
  title: string;
  created_at: string;
  age?: string;
  length?: string;
}

interface StoryItemProps {
  story: Story;
  onClick: () => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  isRemoving?: boolean;
}

export default function StoryItem({
  story,
  onClick,
  showRemoveButton = false,
  onRemove,
  isRemoving = false,
}: StoryItemProps) {
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
    >
      <StoryItemContainer>
        <StoryContent>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{story.title}</div>
          <div style={{ fontSize: 14, color: "#aaa", marginTop: 2 }}>
            {new Date(story.created_at).toLocaleString()}
          </div>
        </StoryContent>
        <StoryTags>
          {story.age && <HashTag $color="green">#Age {story.age}</HashTag>}
          {story.length && <HashTag $color="yellow">#{story.length}</HashTag>}
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
