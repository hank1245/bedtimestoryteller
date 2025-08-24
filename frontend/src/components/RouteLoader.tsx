import styled from "styled-components";

const Loader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60vh;
  color: var(--text-secondary);
  font-size: 14px;
`;

export default function RouteLoader({
  text = "Loading...",
}: {
  text?: string;
}) {
  return (
    <Loader aria-live="polite" role="status">
      {text}
    </Loader>
  );
}
