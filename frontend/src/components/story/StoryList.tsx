import { useNavigate } from "react-router-dom";
import {
  ListContainer,
  StoryList as StyledStoryList,
  EmptyStateContainer,
  EmptyStateEmoji,
  EmptyStateTitle,
  EmptyStateSubtitle,
} from "../shared/SharedStyles";
import StoryItem from "./StoryItem";
import StoryLoading from "../StoryLoading";
import { useRoutePrefetch } from "../../hooks/useRoutePrefetch";

interface Story {
  id: number;
  title: string;
  created_at: string;
  age?: string;
  length?: string;
}

interface StoryListProps {
  stories: Story[];
  loading: boolean;
  error: Error | null;
  showRemoveButton?: boolean;
  onRemoveStory?: (storyId: number) => void;
  isRemoving?: boolean;
  emptyStateMessage?: {
    title: string;
    subtitle: string;
  };
}

export default function StoryList({
  stories,
  loading,
  error,
  showRemoveButton = false,
  onRemoveStory,
  isRemoving = false,
  emptyStateMessage,
}: StoryListProps) {
  const navigate = useNavigate();
  const prefetchStory = useRoutePrefetch("story");

  const handleStoryClick = (storyId: number, title: string) => {
    navigate("/app/story", {
      state: {
        id: storyId,
        title: title,
      },
    });
  };

  const defaultEmptyState = {
    title: "Your Story Collection Awaits",
    subtitle:
      "Create your first magical bedtime story to begin your collection!",
  };

  return (
    <ListContainer>
      {loading ? (
        <StoryLoading subtext="Loading your magical bedtime stories... Just a moment!" />
      ) : error ? (
        <p style={{ color: "#e57373" }}>{error.message}</p>
      ) : stories.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateEmoji>✨</EmptyStateEmoji>
          <EmptyStateTitle>
            {emptyStateMessage?.title || defaultEmptyState.title}
          </EmptyStateTitle>
          <EmptyStateSubtitle>
            {emptyStateMessage?.subtitle || defaultEmptyState.subtitle}
          </EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (
        <StyledStoryList
          onMouseEnter={prefetchStory.onMouseEnter}
          onFocus={prefetchStory.onFocus}
          onTouchStart={prefetchStory.onTouchStart}
        >
          {stories.map((story) => (
            <StoryItem
              key={story.id}
              story={story}
              onClick={() => handleStoryClick(story.id, story.title)}
              showRemoveButton={showRemoveButton}
              onRemove={
                onRemoveStory ? () => onRemoveStory(story.id) : undefined
              }
              isRemoving={isRemoving}
            />
          ))}
        </StyledStoryList>
      )}
    </ListContainer>
  );
}
