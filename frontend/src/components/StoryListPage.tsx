import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "./Card";
import { Button } from "./Button";
import styled from "styled-components";
import { fetchStories, useClerkApiToken } from "../services/client";
import { useClerk } from "@clerk/clerk-react";

const ListContainer = styled.div`
  margin-bottom: 32px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
`;

interface Story {
  id: number;
  story: string;
  created_at: string;
}

export default function StoryListPage({ onCreate }: { onCreate: () => void }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { signOut } = useClerk();
  const setToken = useClerkApiToken();

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
      <CardHeader>
        <CardTitle>📚 Your Bedtime Stories</CardTitle>
        <CardSubtitle>Here are your previously created stories.</CardSubtitle>
      </CardHeader>
      <ListContainer>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "#e57373" }}>{error}</p>
        ) : stories.length === 0 ? (
          <p>No stories yet. Click below to create your first one!</p>
        ) : (
          <ul>
            {stories.map((story) => {
              const title = story.story.split("\n")[0].slice(0, 60);
              return (
                <li
                  key={story.id}
                  style={{
                    marginBottom: 16,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 17 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>
                    {new Date(story.created_at).toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ListContainer>
      <Button $primary onClick={onCreate}>
        Create Another Story
      </Button>
    </Card>
  );
}
