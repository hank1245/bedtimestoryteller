import styled, { css } from "styled-components";

// Transient props($)로 primary, secondary, completed, active, selected, multiple 처리
export const Button = styled.button<{
  $primary?: boolean;
  $secondary?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  width: 100%;
  ${({ $primary }) =>
    $primary &&
    css`
      background: var(--button-primary);
      color: var(--text-primary);
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-small);
      }
      &:active {
        transform: translateY(0);
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    `}
  ${({ $secondary }) =>
    $secondary &&
    css`
      background: var(--button-secondary);
      color: var(--text-primary);
      border: 1px solid var(--card-border);
      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    `}
`;
