/**
 * @file ColorPicker component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("renders color picker", () => {
    render(<ColorPicker value="#ff0000" onChange={() => {}} />);
    expect(screen.getByRole("application")).toBeInTheDocument();
  });

  it("renders hex input with current value", () => {
    render(<ColorPicker value="#ff0000" onChange={() => {}} />);
    const input = screen.getByLabelText("Hex color value");
    expect(input).toHaveValue("ff0000");
  });

  it("calls onChange when hex input changes", () => {
    const ref = { changedValue: null as string | null };
    const handleChange = (hex: string) => {
      ref.changedValue = hex;
    };
    render(<ColorPicker value="#ff0000" onChange={handleChange} />);
    const input = screen.getByLabelText("Hex color value");
    fireEvent.change(input, { target: { value: "00ff00" } });
    expect(ref.changedValue).toBe("#00ff00");
  });

  it("renders preset colors", () => {
    const presets = ["#ff0000", "#00ff00"];
    render(
      <ColorPicker value="#ff0000" onChange={() => {}} presetColors={presets} />,
    );
    expect(screen.getByLabelText("Select color #ff0000")).toBeInTheDocument();
    expect(screen.getByLabelText("Select color #00ff00")).toBeInTheDocument();
  });

  it("calls onChange when preset clicked", () => {
    const ref = { changedValue: null as string | null };
    const handleChange = (hex: string) => {
      ref.changedValue = hex;
    };
    const presets = ["#00ff00"];
    render(
      <ColorPicker
        value="#ff0000"
        onChange={handleChange}
        presetColors={presets}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select color #00ff00"));
    expect(ref.changedValue).toBe("#00ff00");
  });

  it("renders saturation/brightness slider", () => {
    render(<ColorPicker value="#ff0000" onChange={() => {}} />);
    expect(
      screen.getByRole("slider", { name: "Saturation and brightness" }),
    ).toBeInTheDocument();
  });

  it("renders hue slider", () => {
    render(<ColorPicker value="#ff0000" onChange={() => {}} />);
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
  });
});
