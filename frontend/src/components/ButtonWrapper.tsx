import styled from "styled-components";

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 12px;
  position: absolute;
  bottom: 50px;
  left: 32px;
  right: 32px;
  width: calc(100% - 64px);

  @media (max-width: 480px) {
    left: 16px;
    right: 16px;
    width: calc(100% - 32px);
  }
`;
