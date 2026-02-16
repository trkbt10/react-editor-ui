/**
 * @file Checkerboard pattern generation tests
 */

import {
  createCheckerboardCSS,
  createCheckerboardSVG,
  clearCheckerboardCache,
} from "./checkerboard";

describe("createCheckerboardCSS", () => {
  it("returns background properties with default size", () => {
    const result = createCheckerboardCSS();
    expect(result).toHaveProperty("background");
    expect(result).toHaveProperty("backgroundSize");
    expect(result).toHaveProperty("backgroundPosition");
    expect(result.backgroundSize).toBe("8px 8px");
  });

  it("respects custom size parameter", () => {
    const result = createCheckerboardCSS(6);
    expect(result.backgroundSize).toBe("12px 12px");
  });

  it("contains linear-gradient in background", () => {
    const result = createCheckerboardCSS();
    expect(result.background).toContain("linear-gradient");
    expect(result.background).toContain("#ccc");
  });
});

describe("createCheckerboardSVG", () => {
  beforeEach(() => {
    clearCheckerboardCache();
  });

  it("returns data URI with default size", () => {
    const result = createCheckerboardSVG();
    expect(result).toMatch(/^url\("data:image\/svg\+xml,/);
    expect(result).toContain("svg");
  });

  it("respects custom size parameter", () => {
    const result = createCheckerboardSVG(8);
    expect(result).toContain("width%3D%2216%22"); // 8*2=16
    expect(result).toContain("height%3D%2216%22");
  });

  it("caches the result for same size", () => {
    const first = createCheckerboardSVG(6);
    const second = createCheckerboardSVG(6);
    expect(first).toBe(second);
  });

  it("returns different results for different sizes", () => {
    const small = createCheckerboardSVG(4);
    const large = createCheckerboardSVG(8);
    expect(small).not.toBe(large);
  });

  it("contains rect elements for checkerboard pattern", () => {
    const result = createCheckerboardSVG();
    // URL-encoded rect elements
    expect(result).toContain("%3Crect");
  });
});

describe("clearCheckerboardCache", () => {
  it("clears cached patterns", () => {
    const first = createCheckerboardSVG(10);
    clearCheckerboardCache();
    // After clearing, should still return same value (regenerated)
    const second = createCheckerboardSVG(10);
    expect(first).toBe(second);
  });
});
