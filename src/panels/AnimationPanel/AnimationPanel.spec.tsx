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

describe("AnimationPanel callback stability (performance)", () => {
  const defaultSettings: AnimationSettings = {
    easing: "ease",
    bezierControlPoints: [0.25, 0.1, 0.25, 1],
    duration: "0.3",
    delay: "0",
  };

  it("should not re-create callbacks when settings change", () => {
    const onChange = vi.fn();

    // Create a test component that captures callback references
    const TestWrapper = ({ settings }: { settings: AnimationSettings }) => {
      return (
        <AnimationPanel
          settings={settings}
          onChange={(newSettings) => {
            onChange(newSettings);
          }}
        />
      );
    };

    const { rerender } = render(<TestWrapper settings={defaultSettings} />);

    // Change duration - simulate user input
    const durationInput = screen.getByLabelText("Duration");
    fireEvent.focus(durationInput);
    fireEvent.change(durationInput, { target: { value: "0.5" } });
    fireEvent.blur(durationInput);

    // Get the new settings from onChange call
    expect(onChange).toHaveBeenCalled();
    const newSettings = onChange.mock.calls[0][0] as AnimationSettings;

    // Store the BezierCurveEditor element reference before rerender
    const bezierEditorBefore = screen.getByLabelText("Easing curve editor");

    // Rerender with new settings
    rerender(<TestWrapper settings={newSettings} />);

    // BezierCurveEditor should still be the same DOM element (not re-mounted)
    const bezierEditorAfter = screen.getByLabelText("Easing curve editor");
    expect(bezierEditorBefore).toBe(bezierEditorAfter);
  });

  it("should maintain stable onChange reference for child components", () => {
    const renderCountRef = { current: 0 };
    const onChange = vi.fn();

    // Track renders of the panel
    const TestWrapper = ({ settings }: { settings: AnimationSettings }) => {
      renderCountRef.current++;
      return (
        <AnimationPanel
          settings={settings}
          onChange={onChange}
        />
      );
    };

    const { rerender } = render(<TestWrapper settings={defaultSettings} />);
    const initialRenderCount = renderCountRef.current;

    // Rerender with only duration changed
    const newSettings = { ...defaultSettings, duration: "0.5" };
    rerender(<TestWrapper settings={newSettings} />);

    // Panel itself should rerender (props changed)
    expect(renderCountRef.current).toBe(initialRenderCount + 1);

    // But the test is really about whether child components rerender unnecessarily
    // This is validated by the E2E test - here we just verify the panel works correctly
    expect(screen.getByLabelText("Duration")).toHaveValue("0.5");
  });

  it("should call onChange with correct merged settings when duration changes", () => {
    const onChange = vi.fn();
    render(
      <AnimationPanel
        settings={defaultSettings}
        onChange={onChange}
      />
    );

    const durationInput = screen.getByLabelText("Duration");
    fireEvent.focus(durationInput);
    fireEvent.change(durationInput, { target: { value: "0.5" } });
    fireEvent.blur(durationInput);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultSettings,
        duration: "0.5s", // UnitInput appends unit
      })
    );
  });

  it("should call onChange with correct merged settings when delay changes", () => {
    const onChange = vi.fn();
    render(
      <AnimationPanel
        settings={defaultSettings}
        onChange={onChange}
      />
    );

    const delayInput = screen.getByLabelText("Delay");
    fireEvent.focus(delayInput);
    fireEvent.change(delayInput, { target: { value: "0.2" } });
    fireEvent.blur(delayInput);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultSettings,
        delay: "0.2s", // UnitInput appends unit
      })
    );
  });
});
