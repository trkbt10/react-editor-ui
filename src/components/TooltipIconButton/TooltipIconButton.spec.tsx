/**
 * @file TooltipIconButton tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { TooltipIconButton } from "./TooltipIconButton";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("TooltipIconButton", () => {
  it("renders with icon and aria-label from tooltip", () => {
    render(<TooltipIconButton icon={<TestIcon />} tooltip="Test button" />);

    const button = screen.getByRole("button", { name: "Test button" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const ref = { clickCount: 0 };
    const handleClick = () => {
      ref.clickCount += 1;
    };
    render(
      <TooltipIconButton
        icon={<TestIcon />}
        tooltip="Click me"
        onClick={handleClick}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(ref.clickCount).toBe(1);
  });

  it("does not fire click when disabled", () => {
    const ref = { clicked: false };
    const handleClick = () => {
      ref.clicked = true;
    };
    render(
      <TooltipIconButton
        icon={<TestIcon />}
        tooltip="Disabled"
        onClick={handleClick}
        disabled
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(ref.clicked).toBe(false);
  });

  it("applies size variants", () => {
    const { rerender } = render(
      <TooltipIconButton icon={<TestIcon />} tooltip="Small" size="sm" />,
    );
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-sm, 22px)",
    });

    rerender(
      <TooltipIconButton icon={<TestIcon />} tooltip="Medium" size="md" />,
    );
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-md, 28px)",
    });

    rerender(
      <TooltipIconButton icon={<TestIcon />} tooltip="Large" size="lg" />,
    );
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-lg, 32px)",
    });
  });

  it("applies active state styling", () => {
    render(<TooltipIconButton icon={<TestIcon />} tooltip="Active" active />);

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({
      color: "var(--rei-color-icon-active, #2563eb)",
    });
  });

  it("applies variant prop", () => {
    render(
      <TooltipIconButton
        icon={<TestIcon />}
        tooltip="Filled"
        variant="filled"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({
      backgroundColor: "var(--rei-color-hover, rgba(0, 0, 0, 0.04))",
    });
  });

  it("applies custom className", () => {
    render(
      <TooltipIconButton
        icon={<TestIcon />}
        tooltip="Custom"
        className="custom-class"
      />,
    );

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders tooltip element", () => {
    render(<TooltipIconButton icon={<TestIcon />} tooltip="Tooltip content" />);

    // Tooltip element exists in the DOM (hidden by default)
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toBeInTheDocument();
  });
});
