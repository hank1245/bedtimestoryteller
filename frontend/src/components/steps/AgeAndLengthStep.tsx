import { CardHeader, CardTitle, CardSubtitle } from "../shared/Card";
import { FormGroup, FormLabel, FormInput } from "../shared/Form";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../shared/Button";
import { ButtonWrapper } from "../shared/ButtonWrapper";
import { StepProps } from "../../types";
import BackButton from "../shared/BackButton";
import styled from "styled-components";

const AgeAndLengthStepWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const LengthOptions = [
  { value: "very-short", label: "Very Short", description: "(3 min)" },
  { value: "short", label: "Short", description: "(5 min)" },
  { value: "medium", label: "Medium", description: "(10 min)" },
  { value: "long", label: "Long", description: "(15+ min)" },
];

interface AgeAndLengthStepProps extends StepProps {
  lengthValue?: string;
  onLengthChange?: (value: string) => void;
}

export default function AgeAndLengthStep({
  value,
  onChange,
  lengthValue,
  onLengthChange,
  onNext,
  onPrev,
  canProceed,
}: AgeAndLengthStepProps) {
  return (
    <AgeAndLengthStepWrapper>
      <ContentWrapper>
        <CardHeader>
          <CardTitle>🌙 Bedtime Storyteller</CardTitle>
          <CardSubtitle>Let's personalize your story</CardSubtitle>
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
        <FormGroup>
          <FormLabel>How long do you want your story to be?</FormLabel>
          <ChoiceGrid>
            {LengthOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                $selected={lengthValue === option.value}
                onClick={() => onLengthChange?.(option.value)}
              >
                <div>
                  <div>{option.label}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#aaa",
                      marginTop: "4px",
                    }}
                  >
                    {option.description}
                  </div>
                </div>
              </ChoiceButton>
            ))}
          </ChoiceGrid>
        </FormGroup>
      </ContentWrapper>
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
    </AgeAndLengthStepWrapper>
  );
}
