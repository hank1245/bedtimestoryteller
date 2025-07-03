import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { FormGroup, FormLabel, FormInput } from "../Form";
import { Button } from "../Button";
import { StepProps } from "../../types";
import styled from "styled-components";

const ErrorMessage = styled.div`
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  color: var(--accent-pink);
  text-align: center;
  font-size: 14px;
`;

export default function LessonStep({
  value,
  onChange,
  onGenerate,
  onPrev,
  canProceed,
  loading,
  error,
}: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Any lesson to share?</CardTitle>
        <CardSubtitle>What would you like your child to learn?</CardSubtitle>
      </CardHeader>
      {error && <ErrorMessage>{error}</ErrorMessage>}
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
      <div style={{ display: "flex", gap: "12px" }}>
        <Button $secondary onClick={onPrev}>
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
      </div>
    </>
  );
}
