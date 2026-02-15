/**
 * @file Gradient utility function tests
 */
import {
  generateStopId,
  sortStopsByPosition,
  createDefaultGradient,
  gradientToCss,
  gradientToLinearCss,
  interpolateColor,
  getGradientTypeName,
} from "./gradientUtils";
import type { GradientStop, GradientValue } from "./gradientTypes";

describe("generateStopId", () => {
  it("generates unique IDs", () => {
    const id1 = generateStopId();
    const id2 = generateStopId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^stop-/);
    expect(id2).toMatch(/^stop-/);
  });
});

describe("sortStopsByPosition", () => {
  it("sorts stops by position", () => {
    const stops: GradientStop[] = [
      { id: "1", position: 50, color: { hex: "#ff0000", opacity: 100, visible: true } },
      { id: "2", position: 0, color: { hex: "#00ff00", opacity: 100, visible: true } },
      { id: "3", position: 100, color: { hex: "#0000ff", opacity: 100, visible: true } },
    ];

    const sorted = sortStopsByPosition(stops);
    expect(sorted[0].position).toBe(0);
    expect(sorted[1].position).toBe(50);
    expect(sorted[2].position).toBe(100);
  });

  it("does not mutate original array", () => {
    const stops: GradientStop[] = [
      { id: "1", position: 50, color: { hex: "#ff0000", opacity: 100, visible: true } },
      { id: "2", position: 0, color: { hex: "#00ff00", opacity: 100, visible: true } },
    ];

    sortStopsByPosition(stops);
    expect(stops[0].position).toBe(50);
  });
});

describe("createDefaultGradient", () => {
  it("creates a valid default gradient", () => {
    const gradient = createDefaultGradient();
    expect(gradient.type).toBe("linear");
    expect(gradient.angle).toBe(90);
    expect(gradient.stops).toHaveLength(2);
    expect(gradient.stops[0].position).toBe(0);
    expect(gradient.stops[1].position).toBe(100);
  });
});

describe("gradientToCss", () => {
  it("generates linear gradient CSS", () => {
    const gradient: GradientValue = {
      type: "linear",
      angle: 45,
      stops: [
        { id: "1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
        { id: "2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
      ],
    };

    const css = gradientToCss(gradient);
    expect(css).toContain("linear-gradient");
    expect(css).toContain("45deg");
  });

  it("generates radial gradient CSS", () => {
    const gradient: GradientValue = {
      type: "radial",
      angle: 0,
      stops: [
        { id: "1", position: 0, color: { hex: "#ff0000", opacity: 100, visible: true } },
        { id: "2", position: 100, color: { hex: "#0000ff", opacity: 100, visible: true } },
      ],
    };

    const css = gradientToCss(gradient);
    expect(css).toContain("radial-gradient");
    expect(css).toContain("circle");
  });

  it("generates angular gradient CSS", () => {
    const gradient: GradientValue = {
      type: "angular",
      angle: 90,
      stops: [
        { id: "1", position: 0, color: { hex: "#ff0000", opacity: 100, visible: true } },
        { id: "2", position: 100, color: { hex: "#0000ff", opacity: 100, visible: true } },
      ],
    };

    const css = gradientToCss(gradient);
    expect(css).toContain("conic-gradient");
    expect(css).toContain("90deg");
  });

  it("handles opacity in color stops", () => {
    const gradient: GradientValue = {
      type: "linear",
      angle: 0,
      stops: [
        { id: "1", position: 0, color: { hex: "#ff0000", opacity: 50, visible: true } },
        { id: "2", position: 100, color: { hex: "#0000ff", opacity: 100, visible: true } },
      ],
    };

    const css = gradientToCss(gradient);
    expect(css).toContain("0.5");
  });
});

describe("gradientToLinearCss", () => {
  it("always generates a linear gradient for display", () => {
    const gradient: GradientValue = {
      type: "radial",
      angle: 0,
      stops: [
        { id: "1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
        { id: "2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
      ],
    };

    const css = gradientToLinearCss(gradient);
    expect(css).toContain("linear-gradient");
    expect(css).toContain("to right");
  });
});

describe("interpolateColor", () => {
  it("returns first stop color at position 0", () => {
    const stops: GradientStop[] = [
      { id: "1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
      { id: "2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
    ];

    const color = interpolateColor(stops, 0);
    expect(color.hex).toBe("#000000");
  });

  it("returns last stop color at position 100", () => {
    const stops: GradientStop[] = [
      { id: "1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
      { id: "2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
    ];

    const color = interpolateColor(stops, 100);
    expect(color.hex).toBe("#ffffff");
  });

  it("interpolates color at midpoint", () => {
    const stops: GradientStop[] = [
      { id: "1", position: 0, color: { hex: "#000000", opacity: 0, visible: true } },
      { id: "2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
    ];

    const color = interpolateColor(stops, 50);
    expect(color.hex).toBe("#808080");
    expect(color.opacity).toBe(50);
  });

  it("returns default color for empty stops", () => {
    const color = interpolateColor([], 50);
    expect(color.hex).toBe("#000000");
  });

  it("handles single stop", () => {
    const stops: GradientStop[] = [
      { id: "1", position: 50, color: { hex: "#ff0000", opacity: 100, visible: true } },
    ];

    const color = interpolateColor(stops, 0);
    expect(color.hex).toBe("#ff0000");
  });
});

describe("getGradientTypeName", () => {
  it("returns correct display names", () => {
    expect(getGradientTypeName("linear")).toBe("Linear");
    expect(getGradientTypeName("radial")).toBe("Radial");
    expect(getGradientTypeName("angular")).toBe("Angular");
    expect(getGradientTypeName("diamond")).toBe("Diamond");
  });
});
