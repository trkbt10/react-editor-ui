/**
 * @file Input tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("Input", () => {
  it("renders with value", () => {
    render(
      <Input value="test" onChange={() => {}} aria-label="Test input" />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test");
  });

  it("calls onChange when value changes", () => {
    const ref = { capturedValue: "" };
    const handleChange = (value: string) => {
      ref.capturedValue = value;
    };
    render(
      <Input value="" onChange={handleChange} aria-label="Test input" />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new value" } });
    expect(ref.capturedValue).toBe("new value");
  });

  it("renders with placeholder", () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        placeholder="Enter text..."
        aria-label="Test input"
      />,
    );

    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("renders with iconStart", () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        iconStart={<TestIcon />}
        aria-label="Test input"
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders with iconEnd", () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        iconEnd={<TestIcon />}
        aria-label="Test input"
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("shows clear button when clearable and has value", () => {
    render(
      <Input
        value="test"
        onChange={() => {}}
        clearable
        aria-label="Test input"
      />,
    );

    const clearButton = screen.getByRole("button", { name: "Clear" });
    expect(clearButton).toBeInTheDocument();
  });

  it("does not show clear button when value is empty", () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        clearable
        aria-label="Test input"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  });

  it("clears value when clear button is clicked", () => {
    const ref = { capturedValue: "test" };
    const handleChange = (value: string) => {
      ref.capturedValue = value;
    };
    render(
      <Input
        value="test"
        onChange={handleChange}
        clearable
        aria-label="Test input"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(ref.capturedValue).toBe("");
  });

  it("applies disabled state", () => {
    render(
      <Input
        value="test"
        onChange={() => {}}
        disabled
        aria-label="Test input"
      />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("does not show clear button when disabled", () => {
    render(
      <Input
        value="test"
        onChange={() => {}}
        clearable
        disabled
        aria-label="Test input"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Input
        value=""
        onChange={() => {}}
        className="custom-class"
        aria-label="Test input"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
