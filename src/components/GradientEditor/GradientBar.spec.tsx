/**
 * @file GradientBar component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { GradientBar } from "./GradientBar";
import type { GradientValue } from "./gradientTypes";

const createTestGradient = (): GradientValue => ({
  type: "linear",
  angle: 90,
  stops: [
    { id: "stop-1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
    { id: "stop-2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
  ],
});

describe("GradientBar", () => {
  it("renders gradient bar with stops", () => {
    const gradient = createTestGradient();
    render(
      <GradientBar
        value={gradient}
        onChange={() => {}}
        selectedStopId={null}
        onSelectStop={() => {}}
      />,
    );

    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
  });

  it("displays selected stop with different styling", () => {
    const gradient = createTestGradient();
    const { rerender } = render(
      <GradientBar
        value={gradient}
        onChange={() => {}}
        selectedStopId={null}
        onSelectStop={() => {}}
      />,
    );

    const sliders = screen.getAllByRole("slider");
    const firstSlider = sliders[0];

    // Check initial style (not selected)
    expect(firstSlider.style.zIndex).not.toBe("10");

    // Rerender with selection
    rerender(
      <GradientBar
        value={gradient}
        onChange={() => {}}
        selectedStopId="stop-1"
        onSelectStop={() => {}}
      />,
    );

    expect(firstSlider.style.zIndex).toBe("10");
  });

  it("calls onSelectStop when handle is clicked", () => {
    const gradient = createTestGradient();
    let selectedId: string | null = null;
    const handleSelectStop = (id: string) => {
      selectedId = id;
    };

    render(
      <GradientBar
        value={gradient}
        onChange={() => {}}
        selectedStopId={null}
        onSelectStop={handleSelectStop}
      />,
    );

    const sliders = screen.getAllByRole("slider");
    fireEvent.pointerDown(sliders[0]);

    expect(selectedId).toBe("stop-1");
  });

  it("handles disabled state", () => {
    const gradient = createTestGradient();
    let selectedId: string | null = null;
    const handleSelectStop = (id: string) => {
      selectedId = id;
    };

    render(
      <GradientBar
        value={gradient}
        onChange={() => {}}
        selectedStopId={null}
        onSelectStop={handleSelectStop}
        disabled
      />,
    );

    const sliders = screen.getAllByRole("slider");
    fireEvent.pointerDown(sliders[0]);

    expect(selectedId).toBeNull();
  });

  it("applies custom height", () => {
    const gradient = createTestGradient();
    const { container } = render(
      <GradientBar
        value={gradient}
        onChange={() => {}}
        selectedStopId={null}
        onSelectStop={() => {}}
        height={30}
      />,
    );

    const bar = container.firstChild as HTMLElement;
    expect(bar.style.height).toBe("30px");
  });
});
