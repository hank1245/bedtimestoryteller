import styled from "styled-components";

export const FormGroup = styled.div`
  margin-bottom: 30px;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 20px;
  font-weight: 500;
  color: var(--text-primary);
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
  &::placeholder {
    color: var(--text-secondary);
  }
  &:focus {
    outline: none;
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;
