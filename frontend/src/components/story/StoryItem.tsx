import { memo, useEffect, useState } from "react";
import {
  StoryItemContainer,
  StoryContent,
  StoryTags,
  HashTag,
} from "../shared/SharedStyles";
import { useRoutePrefetch } from "../../hooks/useRoutePrefetch";
import { useAuth } from "@clerk/clerk-react";

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

function StoryItem({
  story,
  onClick,
  showRemoveButton = false,
  onRemove,
  isRemoving = false,
}: StoryItemProps) {
  const prefetch = useRoutePrefetch("story");
  const [hasAudio, setHasAudio] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const abort = new AbortController();
    const fetchAudioPresence = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
          }/api/stories/${story.id}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            signal: abort.signal,
          }
        );
        if (res.ok) {
          const data = await res.json();
          const audioUrls = data?.audio_urls || {};
          setHasAudio(Object.keys(audioUrls).length > 0);
        }
      } catch {}
    };
    fetchAudioPresence();
    return () => abort.abort();
  }, [story.id, getToken]);
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
          {hasAudio && <HashTag $color="green">🔊 Audio</HashTag>}
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
