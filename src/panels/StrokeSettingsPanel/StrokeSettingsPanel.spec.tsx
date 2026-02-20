/**
 * @file StrokeSettingsPanel component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { StrokeSettingsPanel, type StrokeSettings } from "./StrokeSettingsPanel";

function createTracker<T>() {
  const calls: T[] = [];
  const fn = (value: T) => {
    calls.push(value);
  };
  return { fn, calls };
}

const defaultSettings: StrokeSettings = {
  tab: "basic",
  style: "solid",
  widthProfile: "uniform",
  join: "miter",
  miterAngle: "28.96",
  frequency: "75",
  wiggle: "30",
  smoothen: "50",
  brushType: "smooth",
  brushDirection: "right",
  brushWidthProfile: "uniform",
};

describe("StrokeSettingsPanel", () => {
  it("renders tab control", () => {
    render(
      <StrokeSettingsPanel
        settings={defaultSettings}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Dynamic")).toBeInTheDocument();
    expect(screen.getByText("Brush")).toBeInTheDocument();
  });

  it("renders basic tab content by default", () => {
    render(
      <StrokeSettingsPanel
        settings={defaultSettings}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Style")).toBeInTheDocument();
    expect(screen.getByText("Width profile")).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
    expect(screen.getByText("Miter angle")).toBeInTheDocument();
  });

  it("renders dynamic tab content", () => {
    const dynamicSettings: StrokeSettings = {
      ...defaultSettings,
      tab: "dynamic",
    };

    render(
      <StrokeSettingsPanel
        settings={dynamicSettings}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Frequency")).toBeInTheDocument();
    expect(screen.getByText("Wiggle")).toBeInTheDocument();
    expect(screen.getByText("Smoothen")).toBeInTheDocument();
  });

  it("renders brush tab content", () => {
    const brushSettings: StrokeSettings = {
      ...defaultSettings,
      tab: "brush",
    };

    render(
      <StrokeSettingsPanel
        settings={brushSettings}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Direction")).toBeInTheDocument();
    expect(screen.getByLabelText("Brush type")).toBeInTheDocument();
  });

  it("calls onChange when tab is changed", () => {
    const { fn: handleChange, calls } = createTracker<StrokeSettings>();
    render(
      <StrokeSettingsPanel
        settings={defaultSettings}
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByText("Dynamic"));

    expect(calls.length).toBe(1);
    expect(calls[0]?.tab).toBe("dynamic");
  });

  it("calls onChange when join type is changed", () => {
    const { fn: handleChange, calls } = createTracker<StrokeSettings>();
    render(
      <StrokeSettingsPanel
        settings={defaultSettings}
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Round join"));

    expect(calls.length).toBe(1);
    expect(calls[0]?.join).toBe("round");
  });

  it("applies custom className", () => {
    const { container } = render(
      <StrokeSettingsPanel
        settings={defaultSettings}
        onChange={() => {}}
        className="custom-panel"
      />,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toBe("custom-panel");
  });
});
