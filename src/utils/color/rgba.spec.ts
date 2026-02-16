/**
 * @file RGBA conversion utility tests
 */

import { colorToRgba } from "./rgba";

describe("colorToRgba", () => {
  it("converts color with full opacity", () => {
    const color = { hex: "#ff0000", opacity: 100, visible: true };
    expect(colorToRgba(color)).toBe("rgba(255, 0, 0, 1)");
  });

  it("converts color with zero opacity", () => {
    const color = { hex: "#00ff00", opacity: 0, visible: true };
    expect(colorToRgba(color)).toBe("rgba(0, 255, 0, 0)");
  });

  it("converts color with partial opacity", () => {
    const color = { hex: "#0000ff", opacity: 50, visible: true };
    expect(colorToRgba(color)).toBe("rgba(0, 0, 255, 0.5)");
  });

  it("handles 3-character hex", () => {
    const color = { hex: "#f00", opacity: 75, visible: true };
    expect(colorToRgba(color)).toBe("rgba(255, 0, 0, 0.75)");
  });

  it("handles white color", () => {
    const color = { hex: "#ffffff", opacity: 100, visible: true };
    expect(colorToRgba(color)).toBe("rgba(255, 255, 255, 1)");
  });

  it("handles black color", () => {
    const color = { hex: "#000000", opacity: 100, visible: true };
    expect(colorToRgba(color)).toBe("rgba(0, 0, 0, 1)");
  });
});
