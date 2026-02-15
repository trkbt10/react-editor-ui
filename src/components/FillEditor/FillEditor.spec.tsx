/**
 * @file FillEditor component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { FillEditor } from "./FillEditor";
import type { FillValue } from "../GradientEditor/gradientTypes";

const createSolidFill = (): FillValue => ({
  type: "solid",
  color: { hex: "#ff0000", opacity: 100, visible: true },
});

const createGradientFill = (): FillValue => ({
  type: "gradient",
  gradient: {
    type: "linear",
    angle: 90,
    stops: [
      { id: "stop-1", position: 0, color: { hex: "#000000", opacity: 100, visible: true } },
      { id: "stop-2", position: 100, color: { hex: "#ffffff", opacity: 100, visible: true } },
    ],
  },
});

describe("FillEditor", () => {
  it("renders solid fill with ColorInput", () => {
    const fill = createSolidFill();
    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
      />,
    );

    // Fill type selector
    expect(screen.getByRole("radio", { name: "Solid" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gradient" })).toBeInTheDocument();

    // ColorInput should be rendered
    expect(screen.getByRole("button", { name: "Open color picker" })).toBeInTheDocument();
  });

  it("renders gradient fill with GradientEditor", () => {
    const fill = createGradientFill();
    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
      />,
    );

    // GradientEditor should be rendered
    expect(screen.getByRole("radio", { name: "Linear gradient" })).toBeInTheDocument();
    expect(screen.getByText("Stops")).toBeInTheDocument();
  });

  it("switches from solid to gradient", () => {
    const fill = createSolidFill();
    let updatedFill: FillValue = fill;
    const handleChange = (f: FillValue) => {
      updatedFill = f;
    };

    render(
      <FillEditor
        value={fill}
        onChange={handleChange}
      />,
    );

    const gradientTab = screen.getByRole("radio", { name: "Gradient" });
    fireEvent.click(gradientTab);

    expect(updatedFill.type).toBe("gradient");
    if (updatedFill.type === "gradient") {
      // First stop should use the solid color
      expect(updatedFill.gradient.stops[0].color.hex).toBe("#ff0000");
    }
  });

  it("switches from gradient to solid", () => {
    const fill = createGradientFill();
    let updatedFill: FillValue = fill;
    const handleChange = (f: FillValue) => {
      updatedFill = f;
    };

    render(
      <FillEditor
        value={fill}
        onChange={handleChange}
      />,
    );

    const solidTab = screen.getByRole("radio", { name: "Solid" });
    fireEvent.click(solidTab);

    expect(updatedFill.type).toBe("solid");
    if (updatedFill.type === "solid") {
      // Should use first gradient stop color
      expect(updatedFill.color.hex).toBe("#000000");
    }
  });

  it("does not call onChange when selecting same type", () => {
    const fill = createSolidFill();
    let callCount = 0;
    const handleChange = () => {
      callCount++;
    };

    render(
      <FillEditor
        value={fill}
        onChange={handleChange}
      />,
    );

    const solidTab = screen.getByRole("radio", { name: "Solid" });
    fireEvent.click(solidTab);

    expect(callCount).toBe(0);
  });

  it("updates solid color", () => {
    const fill = createSolidFill();
    let updatedFill: FillValue = fill;
    const handleChange = (f: FillValue) => {
      updatedFill = f;
    };

    render(
      <FillEditor
        value={fill}
        onChange={handleChange}
      />,
    );

    // Find and update hex input
    const hexInput = screen.getByRole("textbox", { name: "Hex color" });
    fireEvent.change(hexInput, { target: { value: "00ff00" } });

    expect(updatedFill.type).toBe("solid");
    if (updatedFill.type === "solid") {
      expect(updatedFill.color.hex).toBe("#00ff00");
    }
  });

  it("updates gradient", () => {
    const fill = createGradientFill();
    let updatedFill: FillValue = fill;
    const handleChange = (f: FillValue) => {
      updatedFill = f;
    };

    render(
      <FillEditor
        value={fill}
        onChange={handleChange}
      />,
    );

    // Change gradient type
    const radialButton = screen.getByRole("radio", { name: "Radial gradient" });
    fireEvent.click(radialButton);

    expect(updatedFill.type).toBe("gradient");
    if (updatedFill.type === "gradient") {
      expect(updatedFill.gradient.type).toBe("radial");
    }
  });

  it("handles disabled state", () => {
    const fill = createSolidFill();

    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
        disabled
      />,
    );

    const gradientTab = screen.getByRole("radio", { name: "Gradient" });
    expect(gradientTab).toBeDisabled();
  });
});
