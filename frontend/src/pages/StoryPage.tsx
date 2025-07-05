import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardSubtitle } from "../components/Card";
import { Button } from "../components/Button";
import { StoryContainer } from "../components/StoryContainer";
import styled from "styled-components";

const StoryPageContainer = styled.div`
  width: 100%;
  max-width: 660px;
  margin: 0 auto;

  @media (max-width: 480px) {
    max-width: none;
    margin: 0;
    padding: 0;
  }
`;

export default function StoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.state?.title || "Untitled Story";
  const story = location.state?.story || "No story available";

  const goToHome = () => {
    navigate("/");
  };

  const createAnother = () => {
    navigate("/create");
  };

  return (
    <StoryPageContainer>
      <Card>
        <CardHeader>
          <CardTitle>🌙 {title}</CardTitle>
          <CardSubtitle>Sweet dreams ahead!</CardSubtitle>
        </CardHeader>
        <StoryContainer>
          <p>{story}</p>
        </StoryContainer>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button $secondary onClick={goToHome} style={{ flex: 1 }}>
            Back to Stories
          </Button>
          <Button $primary onClick={createAnother} style={{ flex: 1 }}>
            Create Another
          </Button>
        </div>
      </Card>
    </StoryPageContainer>
  );
}
