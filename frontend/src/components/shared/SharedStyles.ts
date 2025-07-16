import styled, { css } from "styled-components";

// 공통 스크롤바 스타일
export const scrollbarStyles = css`
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

// 공통 스크롤 가능한 컨테이너 스타일
export const scrollableContainerStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  ${scrollbarStyles}

  @media (min-width: 768px) {
    max-height: 450px;
  }

  @media (max-width: 480px) {
    max-height: 400px;
  }
`;

export const ListContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const StoryList = styled.ul`
  ${scrollableContainerStyles}
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 40px 20px;
  flex: 1;

  @media (max-width: 480px) {
    min-height: 250px;
    padding: 30px 16px;
  }
`;

export const EmptyStateEmoji = styled.div`
  font-size: 72px;
  margin-bottom: 24px;
  opacity: 0.9;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @media (max-width: 480px) {
    font-size: 56px;
    margin-bottom: 20px;
  }
`;

export const EmptyStateTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  max-width: 400px;

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 10px;
    max-width: 280px;
  }
`;

export const EmptyStateSubtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  max-width: 450px;

  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.5;
    max-width: 300px;
  }
`;

export const StoryItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const StoryContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StoryTags = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 16px;
  align-items: flex-end;
`;

export const HashTag = styled.span<{ $color: string }>`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 12px;
  color: ${(props) => (props.$color === "green" ? "#4CAF50" : "#FFC107")};
  white-space: nowrap;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 16px;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

// Common Page Layout Components
export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 95%;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

// Emoji styling that's used across multiple pages
export const emojiColorCSS = `
  .emoji-color {
    color: initial !important;
    -webkit-text-fill-color: initial !important;
    filter: none !important;
    opacity: 1 !important;
    mix-blend-mode: normal !important;
    display: inline-block;
  }
`;
