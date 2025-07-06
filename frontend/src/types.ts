export interface FormData {
  age: number | string;
  length: string;
  gender: string;
  interests: string[];
  style: string;
  lesson: string;
  story: string;
}

export interface StyleOption {
  value: string;
  label: string;
}

export interface StepProps {
  value?: string | number | string[];
  values?: string[];
  onChange?: (value: any) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onGenerate?: () => void;
  onReset?: () => void;
  canProceed?: boolean;
  loading?: boolean;
  error?: string;
  story?: string;
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface Pronouns {
  they: string;
  them: string;
  their: string;
}

export type StepType =
  | "age"
  | "gender"
  | "interests"
  | "style"
  | "lesson"
  | "story";

export const STEPS: Record<string, StepType> = {
  AGE: "age",
  GENDER: "gender",
  INTERESTS: "interests",
  STYLE: "style",
  LESSON: "lesson",
  STORY: "story",
} as const;
