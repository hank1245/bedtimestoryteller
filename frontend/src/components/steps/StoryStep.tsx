import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { Button } from "../Button";
import { StoryContainer } from "../StoryContainer";
import { StepProps } from "../../types";

export default function StoryStep({ story, onReset }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>🌙 Your Bedtime Story</CardTitle>
        <CardSubtitle>Sweet dreams ahead!</CardSubtitle>
      </CardHeader>
      <StoryContainer>
        <p>{story}</p>
      </StoryContainer>
      <Button $primary onClick={onReset}>
        Create Another Story
      </Button>
    </>
  );
}
