import styled, { css } from "styled-components";

// Transient props($)로 primary, secondary, completed, active, selected, multiple 처리
export const Button = styled.button<{
  $primary?: boolean;
  $secondary?: boolean;
  $small?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $small }) => ($small ? "10px 14px" : "18px 24px")};
  border: none;
  border-radius: ${({ $small }) => ($small ? "8px" : "12px")};
  font-size: ${({ $small }) => ($small ? "12px" : "18px")};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: ${({ $small }) => ($small ? "32px" : "48px")};
  position: relative;
  overflow: hidden;
  width: ${({ $small }) => ($small ? "auto" : "100%")};
  margin: ${({ $small }) => ($small ? "0" : "initial")};

  &:focus-visible {
    outline: 3px solid #7aa2ff;
    outline-offset: 2px;
  }
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
    @media (max-width: 480px) {
    padding: ${({ $small }) => ($small ? "8px 12px" : "16px 20px")};
    font-size: ${({ $small }) => ($small ? "12px" : "14px")};
  }
`;
