import { CardHeader, CardTitle, CardSubtitle } from "../Card";
import { FormGroup, FormLabel, FormInput } from "../Form";
import { Button } from "../Button";
import { ErrorMessage } from "../Feedback";
import { StepProps } from "../../types";

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
      <div
        style={{
          display: "flex",
          gap: "12px",
          position: "absolute",
          bottom: "40px",
          width: "86%",
        }}
      >
        <Button $secondary onClick={onPrev} style={{ flex: 1 }}>
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
