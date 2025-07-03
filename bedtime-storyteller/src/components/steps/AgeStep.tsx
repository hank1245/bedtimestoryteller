import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { FormGroup, FormLabel, FormInput } from "../Form";
import { Button } from "../Button";
import { StepProps } from "../../types";

export default function AgeStep({
  value,
  onChange,
  onNext,
  canProceed,
}: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>🌙 Bedtime Storyteller</CardTitle>
        <CardSubtitle>How old is your little one?</CardSubtitle>
      </CardHeader>
      <FormGroup>
        <FormLabel>Child's Age</FormLabel>
        <FormInput
          type="number"
          min="2"
          max="12"
          value={value}
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          placeholder="Enter age (2-12)"
        />
      </FormGroup>
      <Button $primary onClick={onNext} disabled={!canProceed}>
        Next
      </Button>
    </>
  );
}
