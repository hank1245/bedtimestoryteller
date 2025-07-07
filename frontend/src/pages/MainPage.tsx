import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "../components/Card";
import { Button } from "../components/Button";
import styled from "styled-components";
import { useClerk } from "@clerk/clerk-react";
import { useStories } from "../hooks/useStories";
import { useToast } from "../stores/toastStore";

const ListContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StoryList = styled.ul`
  flex: 1;
  max-height: 450px;
  overflow-y: auto;
  padding: 0;
  margin: 0;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 480px) {
    max-height: 400px;
  }
`;

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
  justify-content: flex-end;
  margin-bottom: 24px;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
  }
`;

export default function MainPage({ onCreate }: { onCreate: () => void }) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // React Query를 사용하여 스토리 목록 가져오기
  const { data: stories = [], isLoading: loading, error } = useStories();

  const handleStoryClick = (storyId: number, title: string) => {
    // 스토리 페이지로 이동 시 ID만 전달하고, 해당 페이지에서 데이터 로드
    navigate("/story", {
      state: {
        id: storyId,
        title: title,
      },
    });
  };

  // 에러 상태 처리 (컴포넌트가 마운트된 후에만 실행)
  useEffect(() => {
    if (error) {
      addToast("error", "Failed to load stories");
    }
  }, [error, addToast]);

  return (
    <Card>
      <TopBar>
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
          onClick={() => signOut()}
        >
          Logout
        </Button>
      </TopBar>
      <StoryPageWrapper>
        <ContentWrapper>
          <StyledCardHeader>
            <CardTitle>📚 Your Bedtime Stories</CardTitle>
            <CardSubtitle>
              Here are your previously created stories.
            </CardSubtitle>
          </StyledCardHeader>
          <ListContainer>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "#e57373" }}>{error.message}</p>
            ) : stories.length === 0 ? (
              <p>No stories yet. Click below to create your first one!</p>
            ) : (
              <StoryList>
                {stories.map((story: any) => (
                  <li
                    key={story.id}
                    style={{
                      marginBottom: 24,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      padding: 22,
                      cursor: "pointer",
                      listStyle: "none",
                    }}
                    onClick={() => handleStoryClick(story.id, story.title)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                      {story.title}
                    </div>
                    <div style={{ fontSize: 14, color: "#aaa", marginTop: 2 }}>
                      {new Date(story.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </StoryList>
            )}
          </ListContainer>
        </ContentWrapper>
        <Button $primary onClick={onCreate} style={{ bottom: -30 }}>
          Create Another Story
        </Button>
      </StoryPageWrapper>
    </Card>
  );
}
