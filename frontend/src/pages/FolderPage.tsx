import {
  MOON_POSITION_TOP_LEFT,
  STARS_COUNT_DEFAULT,
  BACKGROUND_INTENSITY_DEFAULT,
} from "../constants/background";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import styled from "styled-components";
import { CardHeader, CardTitle, CardSubtitle } from "../components/shared/Card";
import {
  useFolderStories,
  useFolders,
  useRemoveStoryFromFolder,
} from "../hooks/useFolders";
import { useToast } from "../stores/toastStore";
import StoryList from "../components/story/StoryList";
import BackButton from "../components/shared/BackButton";
import PageContainer from "../components/shared/PageContainer";

const StoryPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 95%;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledCardHeader = styled(CardHeader)`
  margin-top: 20px;

  @media (max-width: 480px) {
    margin-top: 30px;
  }
`;

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const { addToast } = useToast();

  const folderIdNum = folderId ? parseInt(folderId) : 0;
  const {
    data: folderStories = [],
    isLoading: loading,
    error,
  } = useFolderStories(folderIdNum);
  const { data: folders = [] } = useFolders();
  const removeStoryMutation = useRemoveStoryFromFolder();

  const currentFolder = folders.find((f) => f.id === folderIdNum);

  const handleRemoveStory = async (storyId: number) => {
    try {
      await removeStoryMutation.mutateAsync({ folderId: folderIdNum, storyId });
      addToast("success", "Story removed from folder");
    } catch (error) {
      addToast("error", "Failed to remove story from folder");
    }
  };

  useEffect(() => {
    if (error) {
      addToast("error", "Failed to load folder stories");
    }
  }, [error, addToast]);

  if (!folderIdNum) {
    return (
      <PageContainer
        title="Error"
        subtitle="Invalid folder ID"
        backgroundProps={{
          intensity: BACKGROUND_INTENSITY_DEFAULT,
          moonPosition: MOON_POSITION_TOP_LEFT,
          starsCount: STARS_COUNT_DEFAULT,
        }}
        topBarProps={{
          variant: "split",
          leftContent: (
            <BackButton to="/app?tab=folders" text="Back to Folders" />
          ),
          showSettings: true,
        }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Invalid folder ID</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      backgroundProps={{
        intensity: BACKGROUND_INTENSITY_DEFAULT,
        moonPosition: MOON_POSITION_TOP_LEFT,
        starsCount: STARS_COUNT_DEFAULT,
      }}
      topBarProps={{
        variant: "split",
        leftContent: (
          <BackButton to="/app?tab=folders" text="Back to Folders" />
        ),
        showSettings: true,
      }}
    >
      <StoryPageWrapper>
        <ContentWrapper>
          <StyledCardHeader>
            <CardTitle>
              <span className="emoji-color">📁</span>{" "}
              {currentFolder?.name || "Folder"}
            </CardTitle>
            <CardSubtitle>
              {currentFolder?.description || "Stories in this folder"}
            </CardSubtitle>
          </StyledCardHeader>

          <StoryList
            stories={folderStories}
            loading={loading}
            error={error}
            showRemoveButton={true}
            onRemoveStory={handleRemoveStory}
            isRemoving={removeStoryMutation.isPending}
            emptyStateMessage={{
              title: "No Stories in This Folder",
              subtitle:
                "Add some stories to this folder to organize your collection!",
            }}
          />
        </ContentWrapper>
      </StoryPageWrapper>
    </PageContainer>
  );
}
