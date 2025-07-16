import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import styled from "styled-components";
import { Card, CardHeader, CardTitle, CardSubtitle } from "../components/Card";
import { Button } from "../components/Button";
import {
  useFolderStories,
  useFolders,
  useRemoveStoryFromFolder,
} from "../hooks/useFolders";
import { useToast } from "../stores/toastStore";
import ThreeBackground from "../components/ThreeBackground";
import StoryList from "../components/StoryList";

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

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: absolute;
  top: 20px;
  right: 20px;
  left: 20px;
  z-index: 10;

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    left: 16px;
  }
`;

const BackButton = styled(Button)`
  font-size: 12px;
  padding: 10px 12px;
  min-height: 32px;
  width: auto;
  margin: 0;
  border-radius: 8px;
`;

export default function FolderPage() {
  const navigate = useNavigate();
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
      <div>
        <p>Invalid folder ID</p>
        <Button onClick={() => navigate("/app")}>Go Back</Button>
      </div>
    );
  }

  return (
    <>
      <ThreeBackground
        intensity={0.4}
        moonPosition={[5, 6, -10]}
        starsCount={100}
      />
      <Card>
        <TopBar>
          <BackButton $secondary onClick={() => navigate("/app")}>
            Back to Stories
          </BackButton>
          <Button
            $secondary
            style={{
              fontSize: 12,
              padding: "6px 12px",
              minHeight: "32px",
              width: "auto",
              margin: 0,
              borderRadius: "8px",
            }}
            onClick={() => navigate("/app/settings")}
          >
            Settings
          </Button>
        </TopBar>

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
            />
          </ContentWrapper>
        </StoryPageWrapper>
      </Card>

      {/* 이모지 컬러 강제 스타일 */}
      <style>{`
        .emoji-color {
          color: initial !important;
          -webkit-text-fill-color: initial !important;
          filter: none !important;
          opacity: 1 !important;
          mix-blend-mode: normal !important;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
