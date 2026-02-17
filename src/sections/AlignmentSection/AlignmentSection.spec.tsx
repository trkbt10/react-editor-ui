/**
 * @file AlignmentSection unit tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { AlignmentSection } from "./AlignmentSection";
import type { AlignmentData } from "./types";

describe("AlignmentSection", () => {
  const defaultData: AlignmentData = {
    horizontal: "left",
    vertical: "top",
  };

  it("renders with alignment controls", () => {
    render(<AlignmentSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByText("Alignment")).toBeInTheDocument();
    expect(screen.getByLabelText("Horizontal alignment")).toBeInTheDocument();
    expect(screen.getByLabelText("Vertical alignment")).toBeInTheDocument();
  });

  it("calls onChange when horizontal alignment changes", () => {
    const onChange = vi.fn();

    render(<AlignmentSection data={defaultData} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Align center"));

    expect(onChange).toHaveBeenCalledWith({
      horizontal: "center",
      vertical: "top",
    });
  });

  it("calls onChange when vertical alignment changes", () => {
    const onChange = vi.fn();

    render(<AlignmentSection data={defaultData} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Align middle"));

    expect(onChange).toHaveBeenCalledWith({
      horizontal: "left",
      vertical: "middle",
    });
  });

  it("renders action element when provided", () => {
    render(
      <AlignmentSection
        data={defaultData}
        onChange={vi.fn()}
        action={<button aria-label="Test action">Action</button>}
      />,
    );

    expect(screen.getByLabelText("Test action")).toBeInTheDocument();
  });
});
