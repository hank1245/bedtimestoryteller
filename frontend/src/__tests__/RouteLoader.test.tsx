import { render, screen } from "@testing-library/react";
import RouteLoader from "@/components/RouteLoader";

describe("RouteLoader", () => {
  it("renders with default text and roles", () => {
    render(<RouteLoader />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("aria-live", "polite");
    expect(el).toHaveTextContent("Loading...");
  });

  it("accepts custom text", () => {
    render(<RouteLoader text="Opening..." />);
    expect(screen.getByRole("status")).toHaveTextContent("Opening...");
  });
});
