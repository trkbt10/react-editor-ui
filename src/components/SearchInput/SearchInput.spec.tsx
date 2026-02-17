/**
 * @file SearchInput component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders with placeholder", () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search files..." />);

    expect(screen.getByPlaceholderText("Search files...")).toBeInTheDocument();
  });

  it("renders search input with type search", () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "test" } });

    expect(handleChange).toHaveBeenCalledWith("test");
  });

  it("shows clear button when value is not empty", () => {
    render(<SearchInput value="test" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("hides clear button when value is empty", () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const handleChange = vi.fn();
    render(<SearchInput value="test" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("applies custom aria-label", () => {
    render(<SearchInput value="" onChange={() => {}} aria-label="Filter layers" />);

    expect(screen.getByRole("searchbox", { name: "Filter layers" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <SearchInput value="" onChange={() => {}} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("disables input when disabled prop is true", () => {
    render(<SearchInput value="" onChange={() => {}} disabled />);

    expect(screen.getByRole("searchbox")).toBeDisabled();
  });

  it("does not show clear button when disabled", () => {
    render(<SearchInput value="test" onChange={() => {}} disabled />);

    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });
});
