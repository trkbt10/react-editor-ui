/**
 * @file RotationSection unit tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { RotationSection } from "./RotationSection";
import type { RotationData } from "./types";

describe("RotationSection", () => {
  const defaultData: RotationData = {
    rotation: "45",
  };

  it("renders with rotation input", () => {
    render(<RotationSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByText("Rotation")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotation")).toBeInTheDocument();
  });

  it("displays current rotation value", () => {
    render(<RotationSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByLabelText("Rotation")).toHaveValue("45");
  });

  it("calls onChange when rotation value changes", () => {
    const onChange = vi.fn();

    render(<RotationSection data={defaultData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Rotation"), {
      target: { value: "90" },
    });

    expect(onChange).toHaveBeenCalledWith({
      rotation: "90",
    });
  });

  it("renders transform buttons when onTransformAction is provided", () => {
    render(
      <RotationSection
        data={defaultData}
        onChange={vi.fn()}
        onTransformAction={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Reset rotation")).toBeInTheDocument();
    expect(screen.getByLabelText("Flip horizontal")).toBeInTheDocument();
    expect(screen.getByLabelText("Flip vertical")).toBeInTheDocument();
  });

  it("calls onTransformAction when transform button is clicked", () => {
    const onTransformAction = vi.fn();

    render(
      <RotationSection
        data={defaultData}
        onChange={vi.fn()}
        onTransformAction={onTransformAction}
      />,
    );

    fireEvent.click(screen.getByLabelText("Reset rotation"));

    expect(onTransformAction).toHaveBeenCalledWith("reset");
  });

  it("hides transform buttons when showTransformButtons is false", () => {
    render(
      <RotationSection
        data={defaultData}
        onChange={vi.fn()}
        onTransformAction={vi.fn()}
        showTransformButtons={false}
      />,
    );

    expect(screen.queryByLabelText("Reset rotation")).not.toBeInTheDocument();
  });
});
