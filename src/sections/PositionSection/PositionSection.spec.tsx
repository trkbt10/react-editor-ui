/**
 * @file PositionSection unit tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { PositionSection } from "./PositionSection";
import type { PositionData } from "./types";

describe("PositionSection", () => {
  const defaultData: PositionData = {
    x: "100",
    y: "200",
  };

  it("renders with position inputs", () => {
    render(<PositionSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByText("Position")).toBeInTheDocument();
    expect(screen.getByLabelText("X position")).toBeInTheDocument();
    expect(screen.getByLabelText("Y position")).toBeInTheDocument();
  });

  it("displays current position values", () => {
    render(<PositionSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByLabelText("X position")).toHaveValue("100");
    expect(screen.getByLabelText("Y position")).toHaveValue("200");
  });

  it("calls onChange when X value changes", () => {
    const onChange = vi.fn();

    render(<PositionSection data={defaultData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("X position"), {
      target: { value: "150" },
    });

    expect(onChange).toHaveBeenCalledWith({
      x: "150",
      y: "200",
    });
  });

  it("calls onChange when Y value changes", () => {
    const onChange = vi.fn();

    render(<PositionSection data={defaultData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Y position"), {
      target: { value: "250" },
    });

    expect(onChange).toHaveBeenCalledWith({
      x: "100",
      y: "250",
    });
  });

  it("renders action element when provided", () => {
    render(
      <PositionSection
        data={defaultData}
        onChange={vi.fn()}
        action={<button aria-label="Toggle constraints">Toggle</button>}
      />,
    );

    expect(screen.getByLabelText("Toggle constraints")).toBeInTheDocument();
  });
});
