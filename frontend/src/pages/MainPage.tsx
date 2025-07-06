import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardSubtitle } from "../components/Card";
import { Button } from "../components/Button";
import styled from "styled-components";
import {
  fetchStories,
  fetchStoryById,
  useClerkApiToken,
} from "../services/client";
import { useClerk } from "@clerk/clerk-react";

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
  margin-top: 40px;

  @media (max-width: 480px) {
    margin-top: 40px;
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

interface Story {
  id: number;
  title: string;
  created_at: string;
}

export default function MainPage({ onCreate }: { onCreate: () => void }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { signOut } = useClerk();
  const setToken = useClerkApiToken();
  const navigate = useNavigate();

  const handleStoryClick = async (storyId: number) => {
    try {
      const fullStory = await fetchStoryById(storyId);
      navigate("/story", {
        state: {
          id: storyId,
          title: fullStory.title,
          story: fullStory.story,
        },
      });
    } catch (err) {
      setError("Failed to load story");
    }
  };

  useEffect(() => {
    const loadStories = async () => {
      try {
        await setToken(); // 토큰 설정
        const data = await fetchStories();
        setStories(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load stories");
        setLoading(false);
      }
    };

    loadStories();
  }, [setToken]);

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
              <p style={{ color: "#e57373" }}>{error}</p>
            ) : stories.length === 0 ? (
              <p>No stories yet. Click below to create your first one!</p>
            ) : (
              <StoryList>
                {stories.map((story) => (
                  <li
                    key={story.id}
                    style={{
                      marginBottom: 24,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      padding: 20,
                      cursor: "pointer",
                      listStyle: "none",
                    }}
                    onClick={() => handleStoryClick(story.id)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 17 }}>
                      {story.title}
                    </div>
                    <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>
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
