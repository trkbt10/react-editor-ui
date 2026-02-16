/**
 * @file BezierCurveEditor unit tests
 */

import { render, screen } from "@testing-library/react";
import { BezierCurveEditor } from "./BezierCurveEditor";
import type { BezierControlPoints } from "./bezierTypes";
import { EASING_PRESETS, matchPreset, toCubicBezierCss } from "./bezierPresets";

describe("BezierCurveEditor", () => {
  const defaultValue: BezierControlPoints = [0.25, 0.1, 0.25, 1];

  it("renders with default props", () => {
    render(
      <BezierCurveEditor
        value={defaultValue}
        onChange={() => {}}
        aria-label="Easing curve"
      />
    );

    const editor = screen.getByRole("application", { name: "Easing curve" });
    expect(editor).toBeInTheDocument();
  });

  it("renders with custom dimensions", () => {
    render(
      <BezierCurveEditor
        value={defaultValue}
        onChange={() => {}}
        width={300}
        height={200}
      />
    );

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "300");
    expect(svg).toHaveAttribute("height", "200");
  });

  it("applies disabled state styling", () => {
    render(
      <BezierCurveEditor
        value={defaultValue}
        onChange={() => {}}
        disabled
      />
    );

    const svg = document.querySelector("svg");
    expect(svg).toHaveStyle({ opacity: "0.5" });
  });

  it("hides grid when showGrid is false", () => {
    const { container } = render(
      <BezierCurveEditor
        value={defaultValue}
        onChange={() => {}}
        showGrid={false}
      />
    );

    // Grid has 10 lines total (5 vertical + 5 horizontal for 4 divisions)
    // Without grid, we only have reference lines and control lines
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeLessThan(10);
  });

  it("renders bezier curve path", () => {
    const { container } = render(
      <BezierCurveEditor
        value={defaultValue}
        onChange={() => {}}
      />
    );

    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute("d")).toContain("M");
    expect(path?.getAttribute("d")).toContain("C");
  });

  it("renders control point handles", () => {
    const { container } = render(
      <BezierCurveEditor
        value={defaultValue}
        onChange={() => {}}
      />
    );

    // Two visible handles + two hit areas + two fixed points = 6 circles
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(6);
  });
});

describe("bezierPresets", () => {
  describe("matchPreset", () => {
    it("matches linear preset", () => {
      expect(matchPreset([0, 0, 1, 1])).toBe("linear");
    });

    it("matches ease preset", () => {
      expect(matchPreset([0.25, 0.1, 0.25, 1])).toBe("ease");
    });

    it("matches ease-in preset", () => {
      expect(matchPreset([0.42, 0, 1, 1])).toBe("ease-in");
    });

    it("matches ease-out preset", () => {
      expect(matchPreset([0, 0, 0.58, 1])).toBe("ease-out");
    });

    it("matches ease-in-out preset", () => {
      expect(matchPreset([0.42, 0, 0.58, 1])).toBe("ease-in-out");
    });

    it("returns custom for non-matching values", () => {
      expect(matchPreset([0.1, 0.2, 0.3, 0.4])).toBe("custom");
    });

    it("matches within tolerance", () => {
      expect(matchPreset([0.251, 0.101, 0.251, 1.001])).toBe("ease");
    });
  });

  describe("toCubicBezierCss", () => {
    it("formats control points as CSS cubic-bezier", () => {
      expect(toCubicBezierCss([0.25, 0.1, 0.25, 1])).toBe(
        "cubic-bezier(0.25, 0.10, 0.25, 1.00)"
      );
    });

    it("formats linear as CSS cubic-bezier", () => {
      expect(toCubicBezierCss([0, 0, 1, 1])).toBe(
        "cubic-bezier(0.00, 0.00, 1.00, 1.00)"
      );
    });
  });

  describe("EASING_PRESETS", () => {
    it("contains standard CSS easing values", () => {
      expect(EASING_PRESETS.linear).toEqual([0, 0, 1, 1]);
      expect(EASING_PRESETS.ease).toEqual([0.25, 0.1, 0.25, 1]);
      expect(EASING_PRESETS["ease-in"]).toEqual([0.42, 0, 1, 1]);
      expect(EASING_PRESETS["ease-out"]).toEqual([0, 0, 0.58, 1]);
      expect(EASING_PRESETS["ease-in-out"]).toEqual([0.42, 0, 0.58, 1]);
    });
  });
});
