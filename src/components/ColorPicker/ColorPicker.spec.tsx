/**
 * @file ColorPicker component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";
import {
  hexToRgb,
  rgbToHex,
  hexToHsv,
  hsvToHex,
  isValidHex,
  normalizeHex,
} from "./colorUtils";

describe("colorUtils", () => {
  describe("hexToRgb", () => {
    it("converts 6-character hex", () => {
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("converts 3-character hex", () => {
      expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("handles hex without #", () => {
      expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe("rgbToHex", () => {
    it("converts RGB to hex", () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe("#00ff00");
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe("#0000ff");
    });

    it("clamps out of range values", () => {
      expect(rgbToHex({ r: 300, g: -50, b: 128 })).toBe("#ff0080");
    });
  });

  describe("hexToHsv", () => {
    it("converts red hex to HSV", () => {
      const hsv = hexToHsv("#ff0000");
      expect(hsv.h).toBeCloseTo(0, 0);
      expect(hsv.s).toBeCloseTo(100, 0);
      expect(hsv.v).toBeCloseTo(100, 0);
    });

    it("converts white hex to HSV", () => {
      const hsv = hexToHsv("#ffffff");
      expect(hsv.s).toBeCloseTo(0, 0);
      expect(hsv.v).toBeCloseTo(100, 0);
    });

    it("converts black hex to HSV", () => {
      const hsv = hexToHsv("#000000");
      expect(hsv.v).toBeCloseTo(0, 0);
    });
  });

  describe("hsvToHex", () => {
    it("converts HSV to hex", () => {
      expect(hsvToHex({ h: 0, s: 100, v: 100 })).toBe("#ff0000");
      expect(hsvToHex({ h: 120, s: 100, v: 100 })).toBe("#00ff00");
      expect(hsvToHex({ h: 240, s: 100, v: 100 })).toBe("#0000ff");
    });

    it("round-trips hex values", () => {
      const original = "#3b82f6";
      const hsv = hexToHsv(original);
      const result = hsvToHex(hsv);
      expect(result.toLowerCase()).toBe(original);
    });
  });

  describe("isValidHex", () => {
    it("validates 6-character hex", () => {
      expect(isValidHex("#ff0000")).toBe(true);
      expect(isValidHex("ff0000")).toBe(true);
    });

    it("validates 3-character hex", () => {
      expect(isValidHex("#f00")).toBe(true);
      expect(isValidHex("f00")).toBe(true);
    });

    it("rejects invalid hex", () => {
      expect(isValidHex("#gg0000")).toBe(false);
      expect(isValidHex("ff00")).toBe(false);
      expect(isValidHex("ff000000")).toBe(false);
    });
  });

  describe("normalizeHex", () => {
    it("normalizes 3-character hex", () => {
      expect(normalizeHex("#f00")).toBe("#ff0000");
      expect(normalizeHex("f00")).toBe("#ff0000");
    });

    it("normalizes uppercase hex", () => {
      expect(normalizeHex("#FF0000")).toBe("#ff0000");
    });
  });
});

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
