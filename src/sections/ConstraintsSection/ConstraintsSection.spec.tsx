/**
 * @file ConstraintsSection unit tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ConstraintsSection } from "./ConstraintsSection";
import type { ConstraintsData } from "./types";

describe("ConstraintsSection", () => {
  const defaultData: ConstraintsData = {
    horizontal: "left",
    vertical: "top",
  };

  it("renders with constraint controls", () => {
    render(<ConstraintsSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByText("Constraints")).toBeInTheDocument();
    expect(screen.getByLabelText("Horizontal constraint")).toBeInTheDocument();
    expect(screen.getByLabelText("Vertical constraint")).toBeInTheDocument();
  });

  it("renders ConstraintVisualization", () => {
    render(<ConstraintsSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByLabelText("Toggle left constraint")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle top constraint")).toBeInTheDocument();
  });

  it("calls onChange when horizontal constraint changes", () => {
    const onChange = vi.fn();

    render(<ConstraintsSection data={defaultData} onChange={onChange} />);

    // Click on right constraint when left is active toggles to left-right
    fireEvent.click(screen.getByLabelText("Toggle right constraint"));

    expect(onChange).toHaveBeenCalledWith({
      horizontal: "left-right",
      vertical: "top",
    });
  });

  it("calls onChange when vertical constraint changes", () => {
    const onChange = vi.fn();

    render(<ConstraintsSection data={defaultData} onChange={onChange} />);

    // Click on bottom constraint when top is active toggles to top-bottom
    fireEvent.click(screen.getByLabelText("Toggle bottom constraint"));

    expect(onChange).toHaveBeenCalledWith({
      horizontal: "left",
      vertical: "top-bottom",
    });
  });
});
