import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { StepProps } from "../../types";

export default function GenderStep({
  value,
  onChange,
  onNext,
  onPrev,
  canProceed,
}: StepProps) {
  const options = ["Boy", "Girl", "Non-binary", "Prefer not to say"];
  return (
    <>
      <CardHeader>
        <CardTitle>Tell us about your child</CardTitle>
        <CardSubtitle>This helps us personalize the story</CardSubtitle>
      </CardHeader>
      <ChoiceGrid>
        {options.map((option) => (
          <ChoiceButton
            key={option}
            $selected={value === option}
            onClick={() => onChange?.(option)}
          >
            {option}
          </ChoiceButton>
        ))}
      </ChoiceGrid>
      <ButtonWrapper>
        <Button $secondary onClick={onPrev} style={{ flex: 1 }}>
          Back
        </Button>
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
