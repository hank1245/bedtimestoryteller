import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createStory, useClerkApiToken } from "./services/client";
import "./App.css";
import { FormData, ProgressBarProps, Pronouns, STEPS } from "./types";
import { generateStoryWithClaude } from "./services/anthropic";
import styled from "styled-components";
import { Card } from "./components/Card";
import { ProgressBarContainer, ProgressDot } from "./components/ProgressBar";
import AgeStep from "./components/steps/AgeStep";
import GenderStep from "./components/steps/GenderStep";
import InterestsStep from "./components/steps/InterestsStep";
import StyleStep from "./components/steps/StyleStep";
import LessonStep from "./components/steps/LessonStep";
import StoryStep from "./components/steps/StoryStep";

function generateDemoStory(formData: FormData): string {
  const { age, gender, interests, style, lesson } = formData;
  const pronouns: Pronouns =
    gender === "Girl"
      ? { they: "she", them: "her", their: "her" }
      : gender === "Boy"
      ? { they: "he", them: "him", their: "his" }
      : { they: "they", them: "them", their: "their" };

  const mainInterest = interests[0] || "adventure";
  const storyStyles: Record<string, string> = {
    funny: "with lots of giggles and silly moments",
    gentle: "with soft, comforting moments",
    adventurous: "with exciting discoveries",
    magical: "with wonderful enchantments",
    educational: "with fascinating new things to learn",
  };

  return `Once upon a time, in a land filled with ${mainInterest.toLowerCase()}, there lived a brave ${age}-year-old explorer named Sam. Every night before bed, Sam would look out ${
    pronouns.their
  } window and dream of ${mainInterest.toLowerCase()} adventures.

One peaceful evening, Sam discovered a magical path that led to a wonderful place where ${interests
    .join(", ")
    .toLowerCase()} came to life. The journey was ${
    storyStyles[style] || "filled with wonder"
  }.

As Sam explored this magical world, ${
    pronouns.they
  } met friendly creatures who taught ${
    pronouns.them
  } about ${lesson}. Through ${
    pronouns.their
  } adventure, Sam learned that ${lesson} makes every day brighter and every friendship stronger.

When it was time to return home, Sam carried this important lesson in ${
    pronouns.their
  } heart. ${
    pronouns.they
  } smiled peacefully, knowing that tomorrow would bring new opportunities to practice ${lesson} and share kindness with everyone around ${
    pronouns.them
  }.

And so, Sam drifted off to sleep with happy dreams, ready for another day of wonder and discovery.

The End. Sweet dreams! 🌙✨`;
}

const AppContainer = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
`;

function App() {
  const [currentStep, setCurrentStep] = useState(STEPS.AGE);
  const [formData, setFormData] = useState<FormData>({
    age: "",
    gender: "",
    interests: [],
    style: "",
    lesson: "",
    story: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setToken = useClerkApiToken();
  useEffect(() => {
    setToken();
  }, [setToken]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const generateStory = async () => {
    setLoading(true);
    setError("");
    try {
      let response: string;
      try {
        response = await generateStoryWithClaude(formData);
      } catch (apiError) {
        console.warn("Claude API failed, using fallback story:", apiError);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        response = generateDemoStory(formData);
      }
      updateFormData("story", response);
      // POST to backend
      await createStory(response);
      setCurrentStep(STEPS.STORY);
      // Redirect to story list after short delay
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate story. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      age: "",
      gender: "",
      interests: [],
      style: "",
      lesson: "",
      story: "",
    });
    setCurrentStep(STEPS.AGE);
    setError("");
  };

  const getStepNumber = (): number => {
    const steps = Object.values(STEPS);
    return steps.indexOf(currentStep) + 1;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case STEPS.AGE:
        return (
          typeof formData.age === "number" &&
          formData.age >= 2 &&
          formData.age <= 12
        );
      case STEPS.GENDER:
        return formData.gender.length > 0;
      case STEPS.INTERESTS:
        return formData.interests.length > 0;
      case STEPS.STYLE:
        return formData.style.length > 0;
      case STEPS.LESSON:
        return formData.lesson.length > 0;
      default:
        return false;
    }
  };

  return (
    <AppContainer>
      <Card>
        {currentStep === STEPS.AGE && (
          <AgeStep
            value={formData.age}
            onChange={(value: number) => updateFormData("age", value)}
            onNext={nextStep}
            canProceed={canProceed()}
          />
        )}
        {currentStep === STEPS.GENDER && (
          <GenderStep
            value={formData.gender}
            onChange={(value: string) => updateFormData("gender", value)}
            onNext={nextStep}
            onPrev={prevStep}
            canProceed={canProceed()}
          />
        )}
        {currentStep === STEPS.INTERESTS && (
          <InterestsStep
            values={formData.interests}
            onChange={(values: string[]) => updateFormData("interests", values)}
            onNext={nextStep}
            onPrev={prevStep}
            canProceed={canProceed()}
          />
        )}
        {currentStep === STEPS.STYLE && (
          <StyleStep
            value={formData.style}
            onChange={(value: string) => updateFormData("style", value)}
            onNext={nextStep}
            onPrev={prevStep}
            canProceed={canProceed()}
          />
        )}
        {currentStep === STEPS.LESSON && (
          <LessonStep
            value={formData.lesson}
            onChange={(value: string) => updateFormData("lesson", value)}
            onGenerate={generateStory}
            onPrev={prevStep}
            canProceed={canProceed()}
            loading={loading}
            error={error}
          />
        )}
        {currentStep === STEPS.STORY && (
          <StoryStep story={formData.story} onReset={resetForm} />
        )}
      </Card>
      <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
    </AppContainer>
  );
}

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <ProgressBarContainer>
      {Array.from({ length: totalSteps }, (_, i) => (
        <ProgressDot
          key={i}
          $completed={i + 1 < currentStep}
          $active={i + 1 === currentStep}
        />
      ))}
    </ProgressBarContainer>
  );
}

export default App;
