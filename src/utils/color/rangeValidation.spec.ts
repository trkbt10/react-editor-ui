/**
 * @file Range validation utility tests
 */

import { parsePercentageInput, validatePercentageOnBlur } from "./rangeValidation";

describe("parsePercentageInput", () => {
  it("accepts valid percentage values", () => {
    expect(parsePercentageInput("0")).toEqual({ isValid: true, parsed: 0 });
    expect(parsePercentageInput("50")).toEqual({ isValid: true, parsed: 50 });
    expect(parsePercentageInput("100")).toEqual({ isValid: true, parsed: 100 });
  });

  it("rejects values below 0", () => {
    expect(parsePercentageInput("-1")).toEqual({ isValid: false, parsed: null });
    expect(parsePercentageInput("-100")).toEqual({ isValid: false, parsed: null });
  });

  it("rejects values above 100", () => {
    expect(parsePercentageInput("101")).toEqual({ isValid: false, parsed: null });
    expect(parsePercentageInput("200")).toEqual({ isValid: false, parsed: null });
  });

  it("rejects non-numeric values", () => {
    expect(parsePercentageInput("abc")).toEqual({ isValid: false, parsed: null });
    expect(parsePercentageInput("")).toEqual({ isValid: false, parsed: null });
    expect(parsePercentageInput("12.5")).toEqual({ isValid: true, parsed: 12 }); // parseInt behavior
  });

  it("handles strings with leading/trailing characters", () => {
    expect(parsePercentageInput("50%")).toEqual({ isValid: true, parsed: 50 }); // parseInt stops at %
    expect(parsePercentageInput("abc50")).toEqual({ isValid: false, parsed: null });
  });
});

describe("validatePercentageOnBlur", () => {
  it("returns input value when valid", () => {
    expect(validatePercentageOnBlur("50", 75)).toBe("50");
    expect(validatePercentageOnBlur("0", 75)).toBe("0");
    expect(validatePercentageOnBlur("100", 75)).toBe("100");
  });

  it("returns fallback when invalid", () => {
    expect(validatePercentageOnBlur("-10", 75)).toBe("75");
    expect(validatePercentageOnBlur("150", 75)).toBe("75");
    expect(validatePercentageOnBlur("abc", 75)).toBe("75");
    expect(validatePercentageOnBlur("", 75)).toBe("75");
  });

  it("uses provided fallback value", () => {
    expect(validatePercentageOnBlur("invalid", 0)).toBe("0");
    expect(validatePercentageOnBlur("invalid", 100)).toBe("100");
    expect(validatePercentageOnBlur("invalid", 42)).toBe("42");
  });
});
