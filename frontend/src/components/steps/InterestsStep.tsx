import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { StepProps } from "../../types";
import BackButton from "../shared/BackButton";

const INTEREST_OPTIONS = [
  "Animals",
  "Space",
  "Magic",
  "Adventure",
  "Nature",
  "Friendship",
  "Pirates",
  "Princesses",
  "Dinosaurs",
  "Robots",
  "Ocean",
  "Forest",
];

export default function InterestsStep({
  values,
  onChange,
  onNext,
  onPrev,
  canProceed,
}: StepProps) {
  const toggleInterest = (interest: string) => {
    if (!values || !onChange) return;
    const newValues = values.includes(interest)
      ? values.filter((v) => v !== interest)
      : [...values, interest];
    onChange(newValues);
  };
  return (
    <>
      <CardHeader>
        <CardTitle>What does your child love?</CardTitle>
        <CardSubtitle>Select all that apply</CardSubtitle>
      </CardHeader>
      <ChoiceGrid>
        {INTEREST_OPTIONS.map((interest) => (
          <ChoiceButton
            key={interest}
            $multiple
            $selected={values?.includes(interest)}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </ChoiceButton>
        ))}
      </ChoiceGrid>
      <ButtonWrapper>
        <BackButton
          onClick={onPrev}
          text="Back"
          variant="normal"
          style={{ flex: 1 }}
        />
        <Button
          $primary
          onClick={onNext}
          disabled={!canProceed}
          style={{ flex: 1 }}
        >
          Next
        </Button>
      </ButtonWrapper>
    </>
  );
}
