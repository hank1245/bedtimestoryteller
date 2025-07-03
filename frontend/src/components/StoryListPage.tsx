import { Card, CardHeader, CardTitle, CardSubtitle } from "./Card";
import { Button } from "./Button";
import styled from "styled-components";

const ListContainer = styled.div`
  margin-bottom: 32px;
`;

export default function StoryListPage({
  stories,
  onCreate,
}: {
  stories: string[];
  onCreate: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📚 Your Bedtime Stories</CardTitle>
        <CardSubtitle>Here are your previously created stories.</CardSubtitle>
      </CardHeader>
      <ListContainer>
        {stories.length === 0 ? (
          <p>No stories yet. Click below to create your first one!</p>
        ) : (
          <ul>
            {stories.map((story, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: 16,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    maxHeight: 80,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {story.slice(0, 200)}
                  {story.length > 200 ? "..." : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ListContainer>
      <Button $primary onClick={onCreate}>
        Create Another Story
      </Button>
    </Card>
  );
}
