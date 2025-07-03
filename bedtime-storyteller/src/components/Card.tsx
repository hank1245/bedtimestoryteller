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
