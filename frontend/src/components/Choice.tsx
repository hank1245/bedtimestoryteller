import styled, { css } from "styled-components";

export const ChoiceGrid = styled.div<{
  $large?: boolean;
}>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ $large }) => ($large ? "16px" : "12px")};
  margin-bottom: 24px;
  max-height: 70%;
`;

export const ChoiceButton = styled.button<{
  $selected?: boolean;
  $multiple?: boolean;
  $large?: boolean;
}>`
  padding: ${({ $large }) => ($large ? "24px 16px" : "16px 12px")};
  background: var(--button-secondary);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: ${({ $large }) => ($large ? "16px" : "14px")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ $large }) => ($large ? "160px" : "60px")};
  position: ${({ $multiple }) => ($multiple ? "relative" : "static")};

  &:focus {
    outline: none;
  }

  ${({ $selected, $multiple }) =>
    $selected &&
    $multiple &&
    css`
      background: var(--button-primary) !important;
      border-color: var(--accent-blue) !important;
      &::after {
        content: "✓";
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 12px;
        color: var(--text-primary);
      }
    `}
  ${({ $selected, $multiple }) =>
    $selected &&
    !$multiple &&
    css`
      background: var(--button-primary) !important;
      border-color: var(--accent-blue) !important;
    `}
  &:hover:not(:disabled) {
    background: ${({ $selected }) =>
      $selected ? "var(--button-primary)" : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-1px);
  }
`;
