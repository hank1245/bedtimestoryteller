import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { FormGroup, FormLabel, FormInput } from "../Form";
import { Button } from "../Button";
import { StepProps } from "../../types";
import styled from "styled-components";

const AgeStepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 95%;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export default function AgeStep({
  value,
  onChange,
  onNext,
  onPrev,
  canProceed,
}: StepProps) {
  return (
    <AgeStepWrapper>
      <ContentWrapper>
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
      </ContentWrapper>
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
    </AgeStepWrapper>
  );
}
