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

    const gradientTab = screen.getByRole("radio", { name: "Gradient fill" });
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

    const solidTab = screen.getByRole("radio", { name: "Solid fill" });
    fireEvent.click(solidTab);

    expect(updatedFill.type).toBe("solid");
    if (updatedFill.type === "solid") {
      // Should use first gradient stop color
      expect(updatedFill.color.hex).toBe("#000000");
    }
  });

  it("switches from solid to image", () => {
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

    const imageTab = screen.getByRole("radio", { name: "Image fill" });
    fireEvent.click(imageTab);

    expect(updatedFill.type).toBe("image");
    if (updatedFill.type === "image") {
      expect(updatedFill.image.url).toBe("");
      expect(updatedFill.image.mode).toBe("fill");
    }
  });

  it("switches from solid to pattern", () => {
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

    const patternTab = screen.getByRole("radio", { name: "Pattern fill" });
    fireEvent.click(patternTab);

    expect(updatedFill.type).toBe("pattern");
    if (updatedFill.type === "pattern") {
      expect(updatedFill.pattern.sourceUrl).toBe("");
      expect(updatedFill.pattern.tileType).toBe("grid");
    }
  });

  it("switches from solid to video", () => {
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

    const videoTab = screen.getByRole("radio", { name: "Video fill" });
    fireEvent.click(videoTab);

    expect(updatedFill.type).toBe("video");
    if (updatedFill.type === "video") {
      expect(updatedFill.video.url).toBe("");
      expect(updatedFill.video.loop).toBe(true);
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

    const solidTab = screen.getByRole("radio", { name: "Solid fill" });
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

    const gradientTab = screen.getByRole("radio", { name: "Gradient fill" });
    expect(gradientTab).toBeDisabled();
  });

  it("calls onImageUpload when upload button clicked", () => {
    const fill = createImageFill();
    let uploadCallCount = 0;
    const onImageUpload = () => {
      uploadCallCount++;
    };

    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
        onImageUpload={onImageUpload}
      />,
    );

    const uploadButton = screen.getByRole("button", { name: /Upload image/i });
    fireEvent.click(uploadButton);

    expect(uploadCallCount).toBe(1);
  });

  it("calls onPatternSelect when select source button clicked", () => {
    const fill = createPatternFill();
    let selectCallCount = 0;
    const onPatternSelect = () => {
      selectCallCount++;
    };

    render(
      <FillEditor
        value={fill}
        onChange={() => {}}
        onPatternSelect={onPatternSelect}
      />,
    );

    const selectButton = screen.getByRole("button", { name: /Select source/i });
    fireEvent.click(selectButton);

    expect(selectCallCount).toBe(1);
  });
});
