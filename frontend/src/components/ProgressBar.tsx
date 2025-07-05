import styled, { css } from "styled-components";

export const ProgressBarContainer = styled.div`
  position: fixed;
  bottom: 52px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 100;

  @media (max-width: 480px) {
    bottom: 20px;
  }
`;

export const ProgressDot = styled.div<{
  $active?: boolean;
  $completed?: boolean;
}>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  ${({ $active, $completed }) =>
    ($active || $completed) &&
    css`
      background: var(--accent-blue);
      ${$active && "transform: scale(1.2);"}
    `}
`;
