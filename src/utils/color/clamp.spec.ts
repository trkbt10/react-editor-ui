/**
 * @file Clamp utility tests
 */

import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });

  it("clamps value below min to min", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(-1, 0, 100)).toBe(0);
  });

  it("clamps value above max to max", () => {
    expect(clamp(110, 0, 100)).toBe(100);
    expect(clamp(101, 0, 100)).toBe(100);
  });

  it("handles negative ranges", () => {
    expect(clamp(-50, -100, -10)).toBe(-50);
    expect(clamp(0, -100, -10)).toBe(-10);
    expect(clamp(-150, -100, -10)).toBe(-100);
  });

  it("handles equal min and max", () => {
    expect(clamp(50, 42, 42)).toBe(42);
    expect(clamp(0, 42, 42)).toBe(42);
  });

  it("handles floating point values", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(-0.1, 0, 1)).toBe(0);
    expect(clamp(1.1, 0, 1)).toBe(1);
  });
});
