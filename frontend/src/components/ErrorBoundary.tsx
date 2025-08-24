import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: var(--text-secondary);
`;

const Box = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 24px;
  max-width: 520px;
`;

const Title = styled.h2`
  margin: 0 0 8px;
  color: var(--text-primary);
`;

const Button = styled.button`
  margin-top: 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
`;

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("App error boundary caught: ", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    // simple reload to recover unknown states
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Wrapper role="alert" aria-live="assertive">
          <Box>
            <Title>Something went wrong</Title>
            <p>Please try again. If the problem persists, come back later.</p>
            <Button onClick={this.handleRetry}>Retry</Button>
          </Box>
        </Wrapper>
      );
    }
    return this.props.children;
  }
}
