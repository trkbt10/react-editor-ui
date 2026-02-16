/**
 * @file Color conversion utility tests
 */

import {
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  hexToHsv,
  hsvToHex,
  isValidHex,
  normalizeHex,
} from "./conversion";

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

  it("handles mixed case", () => {
    expect(hexToRgb("#Ff00FF")).toEqual({ r: 255, g: 0, b: 255 });
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

  it("pads single-digit hex values", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 15 })).toBe("#00000f");
  });
});

describe("rgbToHsv", () => {
  it("converts red to HSV", () => {
    const hsv = rgbToHsv({ r: 255, g: 0, b: 0 });
    expect(hsv.h).toBeCloseTo(0, 0);
    expect(hsv.s).toBeCloseTo(100, 0);
    expect(hsv.v).toBeCloseTo(100, 0);
  });

  it("converts green to HSV", () => {
    const hsv = rgbToHsv({ r: 0, g: 255, b: 0 });
    expect(hsv.h).toBeCloseTo(120, 0);
    expect(hsv.s).toBeCloseTo(100, 0);
    expect(hsv.v).toBeCloseTo(100, 0);
  });

  it("converts blue to HSV", () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 255 });
    expect(hsv.h).toBeCloseTo(240, 0);
    expect(hsv.s).toBeCloseTo(100, 0);
    expect(hsv.v).toBeCloseTo(100, 0);
  });

  it("converts white to HSV", () => {
    const hsv = rgbToHsv({ r: 255, g: 255, b: 255 });
    expect(hsv.s).toBeCloseTo(0, 0);
    expect(hsv.v).toBeCloseTo(100, 0);
  });

  it("converts black to HSV", () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 0 });
    expect(hsv.v).toBeCloseTo(0, 0);
  });
});

describe("hsvToRgb", () => {
  it("converts HSV to RGB", () => {
    expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("converts white HSV to RGB", () => {
    expect(hsvToRgb({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black HSV to RGB", () => {
    expect(hsvToRgb({ h: 0, s: 0, v: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("handles intermediate hues", () => {
    // Yellow (h: 60)
    const yellow = hsvToRgb({ h: 60, s: 100, v: 100 });
    expect(yellow).toEqual({ r: 255, g: 255, b: 0 });

    // Cyan (h: 180)
    const cyan = hsvToRgb({ h: 180, s: 100, v: 100 });
    expect(cyan).toEqual({ r: 0, g: 255, b: 255 });

    // Magenta (h: 300)
    const magenta = hsvToRgb({ h: 300, s: 100, v: 100 });
    expect(magenta).toEqual({ r: 255, g: 0, b: 255 });
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

  it("rejects empty string", () => {
    expect(isValidHex("")).toBe(false);
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

  it("adds # prefix if missing", () => {
    expect(normalizeHex("ff0000")).toBe("#ff0000");
  });
});
