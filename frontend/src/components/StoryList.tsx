import { useNavigate } from "react-router-dom";
import { 
  ListContainer, 
  StoryList as StyledStoryList, 
  EmptyStateContainer, 
  EmptyStateEmoji, 
  EmptyStateTitle, 
  EmptyStateSubtitle 
} from "./shared/SharedStyles";
import StoryItem from "./StoryItem";
import StoryLoading from "./StoryLoading";

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
}

export default function StoryList({ 
  stories, 
  loading, 
  error, 
  showRemoveButton = false, 
  onRemoveStory,
  isRemoving = false 
}: StoryListProps) {
  const navigate = useNavigate();

  const handleStoryClick = (storyId: number, title: string) => {
    navigate("/app/story", {
      state: {
        id: storyId,
        title: title,
      },
    });
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
            Your Story Collection Awaits
          </EmptyStateTitle>
          <EmptyStateSubtitle>
            Start your magical journey by creating your first bedtime story!
          </EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (
        <StyledStoryList>
          {stories.map((story, index) => (
            <StoryItem
              key={story.id}
              story={story}
              onClick={() => handleStoryClick(story.id, story.title)}
              showRemoveButton={showRemoveButton}
              onRemove={onRemoveStory ? () => onRemoveStory(story.id) : undefined}
              isRemoving={isRemoving}
            />
          ))}
        </StyledStoryList>
      )}
    </ListContainer>
  );
}