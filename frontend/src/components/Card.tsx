import styled from "styled-components";

export const Card = styled.div`
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-medium);
  position: relative;
  overflow: hidden;
  max-height: 600px; // 최대 높이 제한
  overflow-y: auto; // 내용이 넘칠 경우 스크롤
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
  }

  @media (max-width: 480px) {
    margin: 0;
    padding: 24px 16px;
  }
`;

export const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  background: linear-gradient(
    135deg,
    var(--text-primary) 0%,
    var(--accent-blue) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const CardSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 400;
`;
