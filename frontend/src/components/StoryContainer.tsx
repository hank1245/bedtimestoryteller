import styled from "styled-components";
import { scrollbarStyles } from "./shared/SharedStyles";

export const StoryContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  margin-bottom: 24px;
  line-height: 1.8;
  border: 1px solid rgba(255, 255, 255, 0.08);

  /* 부드러운 그라데이션 효과 */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );

  /* 약간의 그림자 효과 */
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    max-height: 58vh;
    padding: 20px;
  }

  ${scrollbarStyles}
`;
