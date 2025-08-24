import { CardHeader, CardTitle, CardSubtitle } from "../shared/Card";
import { FormGroup, FormLabel, FormInput } from "../shared/Form";
import { ChoiceGrid, ChoiceButton } from "../shared/Choice";
import { Button } from "../shared/Button";
import { ButtonWrapper } from "../shared/ButtonWrapper";
import { ErrorMessage } from "../shared/Feedback";
import { StepProps } from "../../types";
import BackButton from "../shared/BackButton";

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
        <BackButton
          onClick={onPrev}
          text="Back"
          variant="normal"
          style={{ flex: 1 }}
        />
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
