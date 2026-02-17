/**
 * @file SizeSection unit tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SizeSection } from "./SizeSection";
import type { SizeData } from "./types";

describe("SizeSection", () => {
  const defaultData: SizeData = {
    width: "200",
    height: "100",
  };

  it("renders with size inputs", () => {
    render(<SizeSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Width")).toBeInTheDocument();
    expect(screen.getByLabelText("Height")).toBeInTheDocument();
  });

  it("displays current size values", () => {
    render(<SizeSection data={defaultData} onChange={vi.fn()} />);

    expect(screen.getByLabelText("Width")).toHaveValue("200");
    expect(screen.getByLabelText("Height")).toHaveValue("100");
  });

  it("calls onChange when width value changes", () => {
    const onChange = vi.fn();

    render(<SizeSection data={defaultData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "300" },
    });

    expect(onChange).toHaveBeenCalledWith({
      width: "300",
      height: "100",
    });
  });

  it("calls onChange when height value changes", () => {
    const onChange = vi.fn();

    render(<SizeSection data={defaultData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Height"), {
      target: { value: "150" },
    });

    expect(onChange).toHaveBeenCalledWith({
      width: "200",
      height: "150",
    });
  });
});
