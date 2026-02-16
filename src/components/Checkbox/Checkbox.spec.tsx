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
    const ref = { value: null as boolean | null };
    const handleChange = (checked: boolean) => {
      ref.value = checked;
    };
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(ref.value).toBe(true);
  });

  it("calls onChange with false when checked is true", () => {
    const ref = { value: null as boolean | null };
    const handleChange = (checked: boolean) => {
      ref.value = checked;
    };
    render(
      <Checkbox checked={true} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(ref.value).toBe(false);
  });

  it("does not call onChange when disabled", () => {
    const ref = { value: 0 };
    const handleChange = () => {
      ref.value += 1;
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
    expect(ref.value).toBe(0);
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
    const ref = { value: null as boolean | null };
    const handleChange = (checked: boolean) => {
      ref.value = checked;
    };
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: "Enter" });
    expect(ref.value).toBe(true);
  });

  it("responds to keyboard Space", () => {
    const ref = { value: null as boolean | null };
    const handleChange = (checked: boolean) => {
      ref.value = checked;
    };
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />,
    );
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " " });
    expect(ref.value).toBe(true);
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

describe("Checkbox with switch variant", () => {
  it("renders as a switch", () => {
    render(
      <Checkbox
        variant="switch"
        checked={false}
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  it("renders checked state", () => {
    render(
      <Checkbox
        variant="switch"
        checked={true}
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when clicked", () => {
    const values: boolean[] = [];
    const handleChange = (checked: boolean) => {
      values.push(checked);
    };
    render(
      <Checkbox
        variant="switch"
        checked={false}
        onChange={handleChange}
        aria-label="Test"
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(values).toEqual([true]);
  });

  it("does not call onChange when disabled", () => {
    const values: boolean[] = [];
    const handleChange = (checked: boolean) => {
      values.push(checked);
    };
    render(
      <Checkbox
        variant="switch"
        checked={false}
        onChange={handleChange}
        disabled
        aria-label="Test"
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(values).toEqual([]);
  });

  it("renders with label", () => {
    render(
      <Checkbox
        variant="switch"
        checked={false}
        onChange={() => {}}
        label="Dark mode"
      />,
    );
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
  });

  it("responds to keyboard Enter", () => {
    const values: boolean[] = [];
    const handleChange = (checked: boolean) => {
      values.push(checked);
    };
    render(
      <Checkbox
        variant="switch"
        checked={false}
        onChange={handleChange}
        aria-label="Test"
      />,
    );
    fireEvent.keyDown(screen.getByRole("switch"), { key: "Enter" });
    expect(values).toEqual([true]);
  });
});
