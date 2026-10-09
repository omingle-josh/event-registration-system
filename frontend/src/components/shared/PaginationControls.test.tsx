import { render, screen, fireEvent } from "@testing-library/react";
import { PaginationControls } from "./PaginationControls";

describe("PaginationControls Component", () => {
  let mockSetPage: jest.Mock;

  beforeEach(() => {
    mockSetPage = jest.fn();
  });

  it("should render both Prev and Next buttons", () => {
    render(
      <PaginationControls page={0} setPage={mockSetPage} hasNext={true} isLoading={false} />
    );
    expect(screen.getByRole("button", { name: /Prev/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
  });

  it("should disable Prev button when on the first page", () => {
    render(
      <PaginationControls page={0} setPage={mockSetPage} hasNext={true} isLoading={false} />
    );
    expect(screen.getByRole("button", { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Next/i })).not.toBeDisabled();
  });

  it("should disable Next button when hasNext is false", () => {
    render(
      <PaginationControls page={1} setPage={mockSetPage} hasNext={false} isLoading={false} />
    );
    expect(screen.getByRole("button", { name: /Prev/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Next/i })).toBeDisabled();
  });

  it("should disable both buttons when isLoading is true", () => {
    render(
      <PaginationControls page={1} setPage={mockSetPage} hasNext={true} isLoading={true} />
    );
    expect(screen.getByRole("button", { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Next/i })).toBeDisabled();
  });

  it("should call setPage with an incrementing function when Next is clicked", () => {
    render(
      <PaginationControls page={0} setPage={mockSetPage} hasNext={true} isLoading={false} />
    );
    
    // Click Next
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    
    expect(mockSetPage).toHaveBeenCalledTimes(1);
    
    const setPageArg = mockSetPage.mock.calls[0][0];
    expect(typeof setPageArg).toBe("function");
    
    expect(setPageArg(0)).toBe(1); // p + 1 check
  });
});
