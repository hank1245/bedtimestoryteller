import styled from "styled-components";

export const StoryContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  margin-bottom: 24px;
  line-height: 1.8;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;
