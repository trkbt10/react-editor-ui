/**
 * @file FillEditor component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { FillEditor } from "./FillEditor";
import type { FillValue } from "./fillTypes";
import {
  createDefaultImageFill,
  createDefaultPatternFill,
  createDefaultVideoFill,
} from "./fillUtils";

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

const createImageFill = (): FillValue => ({
  type: "image",
  image: createDefaultImageFill(),
});

const createPatternFill = (): FillValue => ({
  type: "pattern",
  pattern: createDefaultPatternFill(),
});

const createVideoFill = (): FillValue => ({
  type: "video",
  video: createDefaultVideoFill(),
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

    // Fill type selector should have 5 options
    expect(screen.getByRole("radio", { name: "Solid fill" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gradient fill" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Image fill" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Pattern fill" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Video fill" })).toBeInTheDocument();

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

  it("renders image fill with ImageFillEditor", () => {
    const fill = createImageFill();
    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
      />,
    );

    // ImageFillEditor should be rendered
    expect(screen.getByText("No image selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Upload image/i })).toBeInTheDocument();
  });

  it("renders pattern fill with PatternEditor", () => {
    const fill = createPatternFill();
    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
      />,
    );

    // PatternEditor should be rendered
    expect(screen.getByText("No pattern source")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select source/i })).toBeInTheDocument();
  });

  it("renders video fill with VideoFillEditor", () => {
    const fill = createVideoFill();
    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
      />,
    );

    // VideoFillEditor should be rendered
    expect(screen.getByText("Enter video URL")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Video URL" })).toBeInTheDocument();
  });

  it("switches from solid to gradient", () => {
    const fill = createSolidFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    const gradientTab = screen.getByRole("radio", { name: "Gradient fill" });
    fireEvent.click(gradientTab);

    expect(ref.current.type).toBe("gradient");
    if (ref.current.type === "gradient") {
      // First stop should use the solid color
      expect(ref.current.gradient.stops[0].color.hex).toBe("#ff0000");
    }
  });

  it("switches from gradient to solid", () => {
    const fill = createGradientFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    const solidTab = screen.getByRole("radio", { name: "Solid fill" });
    fireEvent.click(solidTab);

    expect(ref.current.type).toBe("solid");
    if (ref.current.type === "solid") {
      // Should use first gradient stop color
      expect(ref.current.color.hex).toBe("#000000");
    }
  });

  it("switches from solid to image", () => {
    const fill = createSolidFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    const imageTab = screen.getByRole("radio", { name: "Image fill" });
    fireEvent.click(imageTab);

    expect(ref.current.type).toBe("image");
    if (ref.current.type === "image") {
      expect(ref.current.image.url).toBe("");
      expect(ref.current.image.mode).toBe("fill");
    }
  });

  it("switches from solid to pattern", () => {
    const fill = createSolidFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    const patternTab = screen.getByRole("radio", { name: "Pattern fill" });
    fireEvent.click(patternTab);

    expect(ref.current.type).toBe("pattern");
    if (ref.current.type === "pattern") {
      expect(ref.current.pattern.sourceUrl).toBe("");
      expect(ref.current.pattern.tileType).toBe("grid");
    }
  });

  it("switches from solid to video", () => {
    const fill = createSolidFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    const videoTab = screen.getByRole("radio", { name: "Video fill" });
    fireEvent.click(videoTab);

    expect(ref.current.type).toBe("video");
    if (ref.current.type === "video") {
      expect(ref.current.video.url).toBe("");
      expect(ref.current.video.loop).toBe(true);
    }
  });

  it("does not call onChange when selecting same type", () => {
    const fill = createSolidFill();
    const ref = { callCount: 0 };

    render(
      <FillEditor
        value={fill}
        onChange={() => { ref.callCount++; }}
      />,
    );

    const solidTab = screen.getByRole("radio", { name: "Solid fill" });
    fireEvent.click(solidTab);

    expect(ref.callCount).toBe(0);
  });

  it("updates solid color", () => {
    const fill = createSolidFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    // Find and update hex input
    const hexInput = screen.getByRole("textbox", { name: "Hex color" });
    fireEvent.change(hexInput, { target: { value: "00ff00" } });

    expect(ref.current.type).toBe("solid");
    if (ref.current.type === "solid") {
      expect(ref.current.color.hex).toBe("#00ff00");
    }
  });

  it("updates gradient", () => {
    const fill = createGradientFill();
    const ref = { current: fill as FillValue };

    render(
      <FillEditor
        value={fill}
        onChange={(f) => { ref.current = f; }}
      />,
    );

    // Change gradient type
    const radialButton = screen.getByRole("radio", { name: "Radial gradient" });
    fireEvent.click(radialButton);

    expect(ref.current.type).toBe("gradient");
    if (ref.current.type === "gradient") {
      expect(ref.current.gradient.type).toBe("radial");
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

    const gradientTab = screen.getByRole("radio", { name: "Gradient fill" });
    expect(gradientTab).toBeDisabled();
  });

  it("calls onImageUpload when upload button clicked", () => {
    const fill = createImageFill();
    const ref = { callCount: 0 };

    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
        onImageUpload={() => { ref.callCount++; }}
      />,
    );

    const uploadButton = screen.getByRole("button", { name: /Upload image/i });
    fireEvent.click(uploadButton);

    expect(ref.callCount).toBe(1);
  });

  it("calls onPatternSelect when select source button clicked", () => {
    const fill = createPatternFill();
    const ref = { callCount: 0 };

    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
        onPatternSelect={() => { ref.callCount++; }}
      />,
    );

    const selectButton = screen.getByRole("button", { name: /Select source/i });
    fireEvent.click(selectButton);

    expect(ref.callCount).toBe(1);
  });
});
