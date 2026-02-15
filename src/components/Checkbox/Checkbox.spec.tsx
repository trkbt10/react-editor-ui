/**
 * @file Checkbox component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders unchecked state", () => {
    render(<Checkbox checked={false} onChange={() => {}} aria-label="Test" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("renders checked state", () => {
    render(<Checkbox checked={true} onChange={() => {}} aria-label="Test" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("renders indeterminate state", () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        indeterminate
        aria-label="Test"
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  });

  it("renders with label", () => {
    render(<Checkbox checked={false} onChange={() => {}} label="My Label" />);
    expect(screen.getByText("My Label")).toBeInTheDocument();
  });

  it("calls onChange when clicked", () => {
    let calledWith: boolean | null = null;
    const handleChange = (checked: boolean) => {
      calledWith = checked;
    };
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(calledWith).toBe(true);
  });

  it("calls onChange with false when checked is true", () => {
    let calledWith: boolean | null = null;
    const handleChange = (checked: boolean) => {
      calledWith = checked;
    };
    render(
      <Checkbox checked={true} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(calledWith).toBe(false);
  });

  it("does not call onChange when disabled", () => {
    let callCount = 0;
    const handleChange = () => {
      callCount += 1;
    };
    render(
      <Checkbox
        checked={false}
        onChange={handleChange}
        disabled
        aria-label="Test"
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(callCount).toBe(0);
  });

  it("renders disabled state", () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        disabled
        aria-label="Test"
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-disabled", "true");
    expect(checkbox).toHaveAttribute("tabindex", "-1");
  });

  it("responds to keyboard Enter", () => {
    let calledWith: boolean | null = null;
    const handleChange = (checked: boolean) => {
      calledWith = checked;
    };
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: "Enter" });
    expect(calledWith).toBe(true);
  });

  it("responds to keyboard Space", () => {
    let calledWith: boolean | null = null;
    const handleChange = (checked: boolean) => {
      calledWith = checked;
    };
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " " });
    expect(calledWith).toBe(true);
  });

  it("applies custom className", () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        className="custom-class"
        aria-label="Test"
      />,
    );
    expect(screen.getByRole("checkbox")).toHaveClass("custom-class");
  });
});
