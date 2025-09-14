import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* Use viewport-based height so we can actually center even if parent lacks explicit height */
  min-height: 60vh;
  text-align: center;

  @media (max-width: 480px) {
    min-height: 50vh;
  }
`;

const BookEmoji = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
  animation: ${bounce} 2s ease-in-out infinite;

  @media (max-width: 480px) {
    font-size: 60px;
    margin-bottom: 16px;
  }
`;

const LoadingText = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const LoadingSubtext = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 300px;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 14px;
    max-width: 250px;
  }
`;

interface StoryLoadingProps {
  subtext?: string;
}

export default function StoryLoading({ subtext }: StoryLoadingProps) {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getDots = () => {
    return ".".repeat(dots);
  };

  const defaultSubtext =
    "We're loading a magical bedtime story just for you. This might take a moment!";

  return (
    <LoadingContainer role="status" aria-live="polite" aria-atomic="true">
      <BookEmoji aria-hidden>📚</BookEmoji>
      <LoadingText>Creating your story{getDots()}</LoadingText>
      <LoadingSubtext>{subtext || defaultSubtext}</LoadingSubtext>
    </LoadingContainer>
  );
}
