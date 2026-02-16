/**
 * @file AnimationPanel unit tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { AnimationPanel } from "./AnimationPanel";
import type { AnimationSettings } from "../../components/BezierCurveEditor/bezierTypes";

describe("AnimationPanel", () => {
  const defaultSettings: AnimationSettings = {
    easing: "ease",
    bezierControlPoints: [0.25, 0.1, 0.25, 1],
    duration: "0.3",
    delay: "0",
  };

  it("renders with title", () => {
    render(
      <AnimationPanel settings={defaultSettings} onChange={() => {}} />
    );

    expect(screen.getByText("Animation")).toBeInTheDocument();
  });

  it("renders easing preset selector", () => {
    render(
      <AnimationPanel settings={defaultSettings} onChange={() => {}} />
    );

    expect(screen.getByText("Easing")).toBeInTheDocument();
    expect(screen.getByLabelText("Easing preset")).toBeInTheDocument();
  });

  it("renders bezier curve editor", () => {
    render(
      <AnimationPanel settings={defaultSettings} onChange={() => {}} />
    );

    expect(screen.getByLabelText("Easing curve editor")).toBeInTheDocument();
  });

  it("renders duration input", () => {
    render(
      <AnimationPanel settings={defaultSettings} onChange={() => {}} />
    );

    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByLabelText("Duration")).toBeInTheDocument();
  });

  it("renders delay input", () => {
    render(
      <AnimationPanel settings={defaultSettings} onChange={() => {}} />
    );

    expect(screen.getByText("Delay")).toBeInTheDocument();
    expect(screen.getByLabelText("Delay")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <AnimationPanel
        settings={defaultSettings}
        onChange={() => {}}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders with custom width", () => {
    const { container } = render(
      <AnimationPanel
        settings={defaultSettings}
        onChange={() => {}}
        width={400}
      />
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveStyle({ width: "400px" });
  });

  it("displays current duration value", () => {
    render(
      <AnimationPanel
        settings={{ ...defaultSettings, duration: "0.5" }}
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText("Duration");
    expect(input).toHaveValue("0.5");
  });

  it("displays current delay value", () => {
    render(
      <AnimationPanel
        settings={{ ...defaultSettings, delay: "0.2" }}
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText("Delay");
    expect(input).toHaveValue("0.2");
  });
});

describe("EasingPresetSelect integration", () => {
  const defaultSettings: AnimationSettings = {
    easing: "ease",
    bezierControlPoints: [0.25, 0.1, 0.25, 1],
    duration: "0.3",
    delay: "0",
  };

  it("displays easing preset selector with curve preview", () => {
    render(
      <AnimationPanel settings={defaultSettings} onChange={() => {}} />
    );

    // The select should show the bezier curve preview (SVG) for non-custom presets
    const selectButton = screen.getByLabelText("Easing preset");
    expect(selectButton).toBeInTheDocument();

    // Check that it contains an SVG preview
    const svg = selectButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("displays custom label for non-preset values", () => {
    const customSettings: AnimationSettings = {
      easing: "custom",
      bezierControlPoints: [0.1, 0.2, 0.3, 0.4],
      duration: "0.3",
      delay: "0",
    };

    render(
      <AnimationPanel settings={customSettings} onChange={() => {}} />
    );

    // Custom preset shows "Custom" text since it has no preview
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});
