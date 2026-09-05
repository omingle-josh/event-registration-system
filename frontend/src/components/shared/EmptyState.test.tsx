import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState Component", () => {
  it("should render the title properly", () => {
    render(<EmptyState title="No items found." />);
    expect(screen.getByText("No items found.")).toBeInTheDocument();
  });

  it("should render the description when provided", () => {
    render(<EmptyState title="Oops" description="Try clearing your filters." />);
    expect(screen.getByText("Oops")).toBeInTheDocument();
    expect(screen.getByText("Try clearing your filters.")).toBeInTheDocument();
  });

  it("should format class names properly based on props", () => {
    const { container } = render(<EmptyState title="Styling" className="custom-class" />);
    // The component applies rounding/border styles + className
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveClass("rounded-xl"); 
  });
});
