/**
 * @file IconButton tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { IconButton } from "./IconButton";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("IconButton", () => {
  it("renders with icon and aria-label", () => {
    render(<IconButton icon={<TestIcon />} aria-label="Test button" />);

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
      <IconButton
        icon={<TestIcon />}
        aria-label="Click me"
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
      <IconButton
        icon={<TestIcon />}
        aria-label="Disabled"
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
      <IconButton icon={<TestIcon />} aria-label="Small" size="sm" />,
    );
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-sm, 22px)",
    });

    rerender(<IconButton icon={<TestIcon />} aria-label="Medium" size="md" />);
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-md, 28px)",
    });

    rerender(<IconButton icon={<TestIcon />} aria-label="Large" size="lg" />);
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-lg, 32px)",
    });

    rerender(<IconButton icon={<TestIcon />} aria-label="XLarge" size="xl" />);
    expect(screen.getByRole("button")).toHaveStyle({
      width: "var(--rei-size-height-xl, 40px)",
    });
  });

  it("applies active state styling", () => {
    render(<IconButton icon={<TestIcon />} aria-label="Active" active />);

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({
      color: "var(--rei-color-icon-active, #2563eb)",
    });
  });

  it("applies filled variant", () => {
    render(
      <IconButton icon={<TestIcon />} aria-label="Filled" variant="filled" />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({
      backgroundColor: "var(--rei-color-hover, rgba(0, 0, 0, 0.04))",
    });
  });

  it("applies minimal variant with no hover effect", () => {
    render(
      <IconButton icon={<TestIcon />} aria-label="Minimal" variant="minimal" />,
    );

    const button = screen.getByRole("button");
    // Minimal variant has transparent background (no visible styling)
    const initialBg = button.style.backgroundColor;
    expect(initialBg).toBe("transparent");

    // Hover should not change background (minimal has no hover effect)
    fireEvent.pointerEnter(button);
    expect(button.style.backgroundColor).toBe("transparent");
  });

  it("applies custom className", () => {
    render(
      <IconButton
        icon={<TestIcon />}
        aria-label="Custom"
        className="custom-class"
      />,
    );

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});
