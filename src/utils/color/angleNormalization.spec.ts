/**
 * @file Angle normalization utility tests
 */

import { normalizeAngle } from "./angleNormalization";

describe("normalizeAngle", () => {
  it("returns value unchanged when in 0-360 range", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(90)).toBe(90);
    expect(normalizeAngle(180)).toBe(180);
    expect(normalizeAngle(270)).toBe(270);
    expect(normalizeAngle(359)).toBe(359);
  });

  it("normalizes 360 to 0", () => {
    expect(normalizeAngle(360)).toBe(0);
  });

  it("normalizes values greater than 360", () => {
    expect(normalizeAngle(450)).toBe(90);
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(900)).toBe(180);
  });

  it("normalizes negative values", () => {
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(-180)).toBe(180);
    expect(normalizeAngle(-270)).toBe(90);
    expect(normalizeAngle(-360)).toBe(0);
    expect(normalizeAngle(-450)).toBe(270);
  });

  it("handles floating point values", () => {
    expect(normalizeAngle(90.5)).toBeCloseTo(90.5, 5);
    expect(normalizeAngle(-90.5)).toBeCloseTo(269.5, 5);
    expect(normalizeAngle(360.5)).toBeCloseTo(0.5, 5);
  });
});
