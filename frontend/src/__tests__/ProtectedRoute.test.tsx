import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";

// We will simulate SignedIn/SignedOut by providing a mock ClerkProvider state
// However, simplest path: render the children (since SignedIn checks context) by mocking @clerk/clerk-react
vi.mock("@clerk/clerk-react", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RedirectToSignIn: () => <div>redirect</div>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("ProtectedRoute", () => {
  it("renders children when signed in", () => {
    render(
      <ProtectedRoute>
        <div>private</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("private")).toBeInTheDocument();
  });
});
