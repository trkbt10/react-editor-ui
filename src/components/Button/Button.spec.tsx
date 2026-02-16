/**
 * @file Button tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("handles click events", () => {
    const state = { clickCount: 0 };
    const handleClick = () => {
      state.clickCount += 1;
    };
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(state.clickCount).toBe(1);
  });

  it("does not fire click when disabled", () => {
    const state = { clicked: false };
    const handleClick = () => {
      state.clicked = true;
    };
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(state.clicked).toBe(false);
  });

  it("renders with iconStart", () => {
    render(<Button iconStart={<TestIcon />}>With Icon</Button>);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("With Icon");
  });

  it("renders with iconEnd", () => {
    render(<Button iconEnd={<TestIcon />}>With Icon</Button>);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies primary variant", () => {
    render(<Button variant="primary">Primary</Button>);

    expect(screen.getByRole("button")).toHaveStyle({
      backgroundColor: "var(--rei-color-primary, #2563eb)",
    });
  });

  it("applies secondary variant by default", () => {
    render(<Button>Secondary</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Secondary variant has transparent background with border
    expect(button).toHaveStyle({
      color: "var(--rei-color-text, #111827)",
    });
  });

  it("applies ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Ghost variant has transparent background - test visual properties
    expect(button).toHaveStyle({
      color: "var(--rei-color-text-muted, #6b7280)",
    });
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">Danger</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Danger variant has subtle red background with red text
    expect(button).toHaveStyle({
      color: "var(--rei-color-error, #dc2626)",
    });
  });

  it("applies size variants", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveStyle({
      height: "var(--rei-size-height-sm, 22px)",
    });

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveStyle({
      height: "var(--rei-size-height-lg, 32px)",
    });
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("supports different button types", () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
  });
});
