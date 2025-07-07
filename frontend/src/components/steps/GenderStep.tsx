import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { ChoiceGrid, ChoiceButton } from "../Choice";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { StepProps } from "../../types";
import { Mars, Venus, NonBinary } from "lucide-react";
import styled from "styled-components";

const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const IconWrapper = styled.div`
  opacity: 0.3;
  transition: opacity 0.2s ease;
  position: absolute;
  top: -30px;
`;

const StyledChoiceButton = styled(ChoiceButton)`
  position: relative;
  overflow: hidden;

  &:hover ${IconWrapper} {
    opacity: 0.5;
  }

  ${({ $selected }) =>
    $selected &&
    `
    ${IconWrapper} {
      opacity: 0.7;
    }
  `}
`;

const getIconForOption = (option: string) => {
  switch (option) {
    case "Boy":
      return <Mars size={30} />;
    case "Girl":
      return <Venus size={30} />;
    case "Non-binary":
      return <NonBinary size={30} />;
    case "Prefer not to say":
      return null;
    default:
      return null;
  }
};

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
      <ChoiceGrid $large>
        {options.map((option) => (
          <StyledChoiceButton
            key={option}
            $selected={value === option}
            $large
            onClick={() => onChange?.(option)}
          >
            <IconContainer>
              {option}
              <IconWrapper>{getIconForOption(option)}</IconWrapper>
            </IconContainer>
          </StyledChoiceButton>
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
