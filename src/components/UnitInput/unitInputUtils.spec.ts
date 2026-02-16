/**
 * @file Unit tests for unitInputUtils
 */

import {
  parseValue,
  formatNumber,
  formatFullValue,
  getDisplayValue,
  clampValue,
  findUnitIndex,
} from "./unitInputUtils";

describe("parseValue", () => {
  it("parses simple numeric value with unit", () => {
    expect(parseValue("10px", "px")).toEqual({ num: 10, unit: "px", isAuto: false });
  });

  it("parses numeric value with different unit", () => {
    expect(parseValue("50%", "px")).toEqual({ num: 50, unit: "%", isAuto: false });
  });

  it("uses default unit when no unit provided", () => {
    expect(parseValue("10", "px")).toEqual({ num: 10, unit: "px", isAuto: false });
  });

  it("parses auto value", () => {
    expect(parseValue("auto", "px")).toEqual({ num: null, unit: "", isAuto: true });
  });

  it("parses auto case-insensitively", () => {
    expect(parseValue("AUTO", "px")).toEqual({ num: null, unit: "", isAuto: true });
    expect(parseValue("Auto", "px")).toEqual({ num: null, unit: "", isAuto: true });
  });

  it("parses negative values", () => {
    expect(parseValue("-10px", "px")).toEqual({ num: -10, unit: "px", isAuto: false });
  });

  it("parses decimal values", () => {
    expect(parseValue("10.5px", "px")).toEqual({ num: 10.5, unit: "px", isAuto: false });
  });

  it("handles whitespace between number and unit", () => {
    expect(parseValue("10 px", "px")).toEqual({ num: 10, unit: "px", isAuto: false });
  });

  it("handles leading/trailing whitespace", () => {
    expect(parseValue("  10px  ", "px")).toEqual({ num: 10, unit: "px", isAuto: false });
  });

  it("returns null for invalid input", () => {
    expect(parseValue("abc", "px")).toEqual({ num: null, unit: "px", isAuto: false });
  });

  it("returns null for empty string", () => {
    expect(parseValue("", "px")).toEqual({ num: null, unit: "px", isAuto: false });
  });

  it("parses first valid number from malformed decimal", () => {
    // parseFloat("10.5.5") returns 10.5
    // Regex captures full "10.5.5" as number part, "px" as unit
    // This documents existing behavior - not ideal but acceptable
    expect(parseValue("10.5.5px", "px")).toEqual({ num: 10.5, unit: "px", isAuto: false });
  });

  it("parses values with leading zeros", () => {
    expect(parseValue("0010px", "px")).toEqual({ num: 10, unit: "px", isAuto: false });
  });

  it("handles zero value", () => {
    expect(parseValue("0px", "px")).toEqual({ num: 0, unit: "px", isAuto: false });
  });

  it("parses percentage unit", () => {
    expect(parseValue("100%", "px")).toEqual({ num: 100, unit: "%", isAuto: false });
  });

  it("handles unit case variations", () => {
    expect(parseValue("10PX", "px")).toEqual({ num: 10, unit: "px", isAuto: false });
    expect(parseValue("10Rem", "px")).toEqual({ num: 10, unit: "rem", isAuto: false });
  });

  it("handles scientific notation as invalid", () => {
    // Scientific notation doesn't match the regex pattern
    expect(parseValue("1e5px", "px")).toEqual({ num: null, unit: "px", isAuto: false });
  });

  it("handles very large numbers", () => {
    expect(parseValue("999999999px", "px")).toEqual({ num: 999999999, unit: "px", isAuto: false });
  });

  it("handles very small decimals", () => {
    expect(parseValue("0.001px", "px")).toEqual({ num: 0.001, unit: "px", isAuto: false });
  });

  it("handles negative decimals", () => {
    expect(parseValue("-0.5px", "px")).toEqual({ num: -0.5, unit: "px", isAuto: false });
  });
});

describe("formatNumber", () => {
  it("formats integers without decimals", () => {
    expect(formatNumber(10)).toBe("10");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-5)).toBe("-5");
  });

  it("formats simple decimals", () => {
    expect(formatNumber(10.5)).toBe("10.5");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatNumber(10.567)).toBe("10.57");
    expect(formatNumber(10.564)).toBe("10.56");
  });

  it("removes trailing zeros", () => {
    expect(formatNumber(10.10)).toBe("10.1");
    expect(formatNumber(10.00)).toBe("10");
  });

  it("handles very small decimals", () => {
    expect(formatNumber(0.01)).toBe("0.01");
    expect(formatNumber(0.001)).toBe("0");
  });

  it("handles large numbers", () => {
    expect(formatNumber(1000000)).toBe("1000000");
  });

  it("handles negative decimals", () => {
    expect(formatNumber(-10.5)).toBe("-10.5");
  });

  it("handles rounding edge cases", () => {
    // Note: JavaScript's toFixed has floating point precision quirks
    // 10.995.toFixed(2) returns "10.99" due to IEEE 754 representation
    expect(formatNumber(10.995)).toBe("10.99");
    expect(formatNumber(10.994)).toBe("10.99");
    expect(formatNumber(10.996)).toBe("11");
  });
});

describe("formatFullValue", () => {
  it("formats number with unit", () => {
    expect(formatFullValue(10, "px", false)).toBe("10px");
  });

  it("returns Auto when isAuto is true", () => {
    expect(formatFullValue(null, "px", true)).toBe("Auto");
    expect(formatFullValue(10, "px", true)).toBe("Auto");
  });

  it("returns empty string for null number", () => {
    expect(formatFullValue(null, "px", false)).toBe("");
  });

  it("formats decimal values correctly", () => {
    expect(formatFullValue(10.5, "px", false)).toBe("10.5px");
  });

  it("formats zero", () => {
    expect(formatFullValue(0, "px", false)).toBe("0px");
  });

  it("formats negative values", () => {
    expect(formatFullValue(-10, "px", false)).toBe("-10px");
  });

  it("works with different units", () => {
    expect(formatFullValue(50, "%", false)).toBe("50%");
    expect(formatFullValue(2, "rem", false)).toBe("2rem");
  });
});

describe("getDisplayValue", () => {
  it("returns formatted number for regular value", () => {
    expect(getDisplayValue({ num: 10, unit: "px", isAuto: false })).toBe("10");
  });

  it("returns Auto for auto value", () => {
    expect(getDisplayValue({ num: null, unit: "", isAuto: true })).toBe("Auto");
  });

  it("returns empty string for null number", () => {
    expect(getDisplayValue({ num: null, unit: "px", isAuto: false })).toBe("");
  });

  it("formats decimal values", () => {
    expect(getDisplayValue({ num: 10.5, unit: "px", isAuto: false })).toBe("10.5");
  });
});

describe("clampValue", () => {
  it("returns value when within bounds", () => {
    expect(clampValue(5, 0, 10)).toBe(5);
  });

  it("clamps to min when below", () => {
    expect(clampValue(-5, 0, 10)).toBe(0);
  });

  it("clamps to max when above", () => {
    expect(clampValue(15, 0, 10)).toBe(10);
  });

  it("returns value when only min is set", () => {
    expect(clampValue(5, 0, undefined)).toBe(5);
    expect(clampValue(-5, 0, undefined)).toBe(0);
  });

  it("returns value when only max is set", () => {
    expect(clampValue(5, undefined, 10)).toBe(5);
    expect(clampValue(15, undefined, 10)).toBe(10);
  });

  it("returns value when no bounds set", () => {
    expect(clampValue(5, undefined, undefined)).toBe(5);
    expect(clampValue(-100, undefined, undefined)).toBe(-100);
  });

  it("handles equal min and max", () => {
    expect(clampValue(5, 5, 5)).toBe(5);
    expect(clampValue(0, 5, 5)).toBe(5);
    expect(clampValue(10, 5, 5)).toBe(5);
  });

  it("handles zero as boundary", () => {
    expect(clampValue(-1, 0, 10)).toBe(0);
    expect(clampValue(1, -10, 0)).toBe(0);
  });

  it("handles negative ranges", () => {
    expect(clampValue(-5, -10, -1)).toBe(-5);
    expect(clampValue(-15, -10, -1)).toBe(-10);
    expect(clampValue(0, -10, -1)).toBe(-1);
  });
});

describe("findUnitIndex", () => {
  const units = [
    { value: "px", label: "px" },
    { value: "%", label: "%" },
    { value: "em", label: "em" },
  ];

  it("finds index of matching unit", () => {
    expect(findUnitIndex(units, "px")).toBe(0);
    expect(findUnitIndex(units, "%")).toBe(1);
    expect(findUnitIndex(units, "em")).toBe(2);
  });

  it("returns 0 for non-matching unit", () => {
    expect(findUnitIndex(units, "rem")).toBe(0);
    expect(findUnitIndex(units, "vw")).toBe(0);
  });

  it("matches case-insensitively", () => {
    expect(findUnitIndex(units, "PX")).toBe(0);
    expect(findUnitIndex(units, "Em")).toBe(2);
  });

  it("returns 0 for empty units array", () => {
    // findIndex returns -1 when not found, which is < 0, so returns 0
    expect(findUnitIndex([], "px")).toBe(0);
  });

  it("handles empty string unit", () => {
    expect(findUnitIndex(units, "")).toBe(0);
  });
});
