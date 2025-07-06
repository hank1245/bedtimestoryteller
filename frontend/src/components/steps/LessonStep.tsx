import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { FormGroup, FormLabel, FormInput } from "../Form";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { ErrorMessage } from "../Feedback";
import { StepProps } from "../../types";

const LESSON_OPTIONS = [
  "Being Kind",
  "Sharing",
  "Courage",
  "Honesty",
  "Friendship",
  "Perseverance",
];

export default function LessonStep({
  value,
  onChange,
  onGenerate,
  onPrev,
  canProceed,
  loading,
  error,
}: StepProps) {
  const handleLessonChoice = (lesson: string) => {
    onChange?.(lesson);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Any lesson to share?</CardTitle>
        <CardSubtitle>What would you like your child to learn?</CardSubtitle>
      </CardHeader>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <FormGroup>
        <FormLabel>Choose a common value or write your own</FormLabel>
        <ChoiceGrid>
          {LESSON_OPTIONS.map((lesson) => (
            <ChoiceButton
              key={lesson}
              $selected={value === lesson}
              onClick={() => handleLessonChoice(lesson)}
            >
              {lesson}
            </ChoiceButton>
          ))}
        </ChoiceGrid>
      </FormGroup>
      <FormGroup>
        <FormLabel>Lesson or Value</FormLabel>
        <FormInput
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.target.value)
          }
          placeholder="e.g., being kind, sharing, courage..."
        />
      </FormGroup>
      <ButtonWrapper>
        <Button $secondary onClick={onPrev} style={{ flex: 1 }}>
          Back
        </Button>
        <Button
          $primary
          onClick={onGenerate}
          disabled={!canProceed || loading}
          style={{ flex: 1 }}
        >
          {loading ? "Loading..." : "Create Story"}
        </Button>
      </ButtonWrapper>
    </>
  );
}
