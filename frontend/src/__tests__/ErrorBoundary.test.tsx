import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { beforeAll, afterAll } from "vitest";

const Boom = () => {
  throw new Error("boom");
};

describe("ErrorBoundary", () => {
  // silence React error boundary logs for cleaner test output
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeAll(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterAll(() => {
    errorSpy.mockRestore();
  });

  it("renders fallback UI and retry button when child throws", () => {
    // Render component that throws
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    // Fallback content
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  // Note: testing window.location.reload in jsdom is brittle; fallback UI coverage is sufficient.
});
