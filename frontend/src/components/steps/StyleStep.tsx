import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { StepProps, StyleOption } from "../../types";

const STYLE_OPTIONS: StyleOption[] = [
  { value: "funny", label: "Funny" },
  { value: "gentle", label: "Gentle" },
  { value: "adventurous", label: "Adventurous" },
  { value: "magical", label: "Magical" },
  { value: "educational", label: "Educational" },
  { value: "heartwarming", label: "Heartwarming" },
  { value: "mysterious", label: "Mysterious" },
  { value: "fantasy", label: "Fantasy" },
  { value: "realistic", label: "Realistic" },
  { value: "silly", label: "Silly" },
];

export default function StyleStep({
  value,
  onChange,
  onNext,
  onPrev,
  canProceed,
}: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>What kind of story tonight?</CardTitle>
        <CardSubtitle>Choose the perfect mood</CardSubtitle>
      </CardHeader>
      <ChoiceGrid>
        {STYLE_OPTIONS.map((option) => (
          <ChoiceButton
            key={option.value}
            $selected={value === option.value}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
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
