/**
 * @file GradientEditor component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { GradientEditor } from "./GradientEditor";
import type { GradientValue } from "./gradientTypes";

const createTestGradient = (): GradientValue => ({
  type: "linear",
  angle: 90,
  stops: [
    { id: "stop-1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
    { id: "stop-2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
  ],
});

describe("GradientEditor", () => {
  it("renders all sub-components", () => {
    const gradient = createTestGradient();
    render(
      <GradientEditor
        value={gradient}
        onChange={() => {}}
      />,
    );

    // Type selector
    expect(screen.getByRole("radio", { name: "Linear gradient" })).toBeInTheDocument();

    // Angle input (visible for linear)
    expect(screen.getByRole("textbox", { name: "Gradient angle" })).toBeInTheDocument();

    // Gradient bar
    expect(screen.getByRole("group", { name: "Gradient preview" })).toBeInTheDocument();

    // Stops label
    expect(screen.getByText("Stops")).toBeInTheDocument();

    // Add button
    expect(screen.getByRole("button", { name: "Add stop" })).toBeInTheDocument();

    // Stop rows
    const positionInputs = screen.getAllByRole("textbox", { name: "Position" });
    expect(positionInputs).toHaveLength(2);
  });

  it("updates gradient type", () => {
    const gradient = createTestGradient();
    const ref = { value: gradient as GradientValue };

    render(
      <GradientEditor
        value={gradient}
        onChange={(g: GradientValue) => {
          ref.value = g;
        }}
      />,
    );

    const radialButton = screen.getByRole("radio", { name: "Radial gradient" });
    fireEvent.click(radialButton);

    expect(ref.value.type).toBe("radial");
  });

  it("updates angle for linear gradient", () => {
    const gradient = createTestGradient();
    const ref = { value: gradient as GradientValue };

    render(
      <GradientEditor
        value={gradient}
        onChange={(g: GradientValue) => {
          ref.value = g;
        }}
      />,
    );

    const angleInput = screen.getByRole("textbox", { name: "Gradient angle" });
    fireEvent.change(angleInput, { target: { value: "45" } });

    expect(ref.value.angle).toBe(45);
  });

  it("hides angle input for radial gradient", () => {
    const gradient: GradientValue = {
      ...createTestGradient(),
      type: "radial",
    };

    render(
      <GradientEditor
        value={gradient}
        onChange={() => {}}
      />,
    );

    expect(screen.queryByRole("textbox", { name: "Gradient angle" })).not.toBeInTheDocument();
  });

  it("adds a new stop", () => {
    const gradient = createTestGradient();
    const ref = { value: gradient as GradientValue };

    render(
      <GradientEditor
        value={gradient}
        onChange={(g: GradientValue) => {
          ref.value = g;
        }}
      />,
    );

    const addButton = screen.getByRole("button", { name: "Add stop" });
    fireEvent.click(addButton);

    expect(ref.value.stops.length).toBe(3);
  });

  it("updates a stop", () => {
    const gradient = createTestGradient();
    const ref = { value: gradient as GradientValue };

    render(
      <GradientEditor
        value={gradient}
        onChange={(g: GradientValue) => {
          ref.value = g;
        }}
      />,
    );

    const positionInputs = screen.getAllByRole("textbox", { name: "Position" });
    fireEvent.change(positionInputs[0], { target: { value: "25" } });

    expect(ref.value.stops[0].position).toBe(25);
  });

  it("removes a stop when there are more than 2", () => {
    const gradient: GradientValue = {
      ...createTestGradient(),
      stops: [
        { id: "stop-1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
        { id: "stop-2", position: 50, color: { hex: "#888888", opacity: 100, visible: true } },
        { id: "stop-3", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
      ],
    };
    const ref = { value: gradient as GradientValue };

    render(
      <GradientEditor
        value={gradient}
        onChange={(g: GradientValue) => {
          ref.value = g;
        }}
      />,
    );

    const removeButtons = screen.getAllByRole("button", { name: "Remove color" });
    fireEvent.click(removeButtons[0]);

    expect(ref.value.stops.length).toBe(2);
  });

  it("does not remove stop when only 2 remain", () => {
    const gradient = createTestGradient();
    const ref = { count: 0 };

    render(
      <GradientEditor
        value={gradient}
        onChange={() => {
          ref.count++;
        }}
      />,
    );

    const removeButtons = screen.getAllByRole("button", { name: "Remove color" });
    fireEvent.click(removeButtons[0]);

    expect(ref.count).toBe(0);
  });

  it("handles disabled state", () => {
    const gradient = createTestGradient();

    render(
      <GradientEditor
        value={gradient}
        onChange={() => {}}
        disabled
      />,
    );

    const addButton = screen.getByRole("button", { name: "Add stop" });
    expect(addButton).toBeDisabled();
  });
});
