import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../Button";
import { StepProps, StyleOption } from "../../types";

const STYLE_OPTIONS: StyleOption[] = [
  { value: "funny", label: "Funny" },
  { value: "gentle", label: "Gentle" },
  { value: "adventurous", label: "Adventurous" },
  { value: "magical", label: "Magical" },
  { value: "educational", label: "Educational" },
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
      <div style={{ display: "flex", gap: "12px" }}>
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
      </div>
    </>
  );
}
