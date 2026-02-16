/**
 * @file ColorInput component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ColorInput } from "./ColorInput";
import type { ColorValue } from "./ColorInput";

describe("ColorInput", () => {
  const defaultValue: ColorValue = {
    hex: "#ff0000",
    opacity: 100,
    visible: true,
  };

  it("renders color swatch", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} />);
    expect(screen.getByLabelText("Open color picker")).toBeInTheDocument();
  });

  it("renders hex input with value", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} />);
    const hexInput = screen.getByLabelText("Hex color");
    expect(hexInput).toHaveValue("ff0000");
  });

  it("renders opacity input with value", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} />);
    const opacityInput = screen.getByLabelText("Opacity");
    expect(opacityInput).toHaveValue("100");
  });

  it("hides visibility toggle by default", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} />);
    expect(screen.queryByLabelText("Hide color")).not.toBeInTheDocument();
  });

  it("shows visibility toggle when showVisibilityToggle is true", () => {
    render(
      <ColorInput
        value={defaultValue}
        onChange={() => {}}
        showVisibilityToggle
      />,
    );
    expect(screen.getByLabelText("Hide color")).toBeInTheDocument();
  });

  it("renders remove button when showRemove is true", () => {
    render(
      <ColorInput value={defaultValue} onChange={() => {}} showRemove />,
    );
    expect(screen.getByLabelText("Remove color")).toBeInTheDocument();
  });

  it("calls onChange when hex input changes", () => {
    const ref = { value: "" };
    const handleChange = (v: ColorValue) => {
      ref.value = v.hex;
    };
    render(<ColorInput value={defaultValue} onChange={handleChange} />);
    const hexInput = screen.getByLabelText("Hex color");
    fireEvent.change(hexInput, { target: { value: "00ff00" } });
    expect(ref.value).toBe("#00ff00");
  });

  it("calls onChange when opacity input changes", () => {
    const ref = { value: -1 };
    const handleChange = (v: ColorValue) => {
      ref.value = v.opacity;
    };
    render(<ColorInput value={defaultValue} onChange={handleChange} />);
    const opacityInput = screen.getByLabelText("Opacity");
    fireEvent.change(opacityInput, { target: { value: "50" } });
    expect(ref.value).toBe(50);
  });

  it("calls onChange when visibility toggle is clicked", () => {
    const ref = { value: true };
    const handleChange = (v: ColorValue) => {
      ref.value = v.visible;
    };
    render(
      <ColorInput
        value={defaultValue}
        onChange={handleChange}
        showVisibilityToggle
      />,
    );
    fireEvent.click(screen.getByLabelText("Hide color"));
    expect(ref.value).toBe(false);
  });

  it("calls onRemove when remove button is clicked", () => {
    const ref = { count: 0 };
    const handleRemove = () => {
      ref.count += 1;
    };
    render(
      <ColorInput
        value={defaultValue}
        onChange={() => {}}
        showRemove
        onRemove={handleRemove}
      />,
    );
    fireEvent.click(screen.getByLabelText("Remove color"));
    expect(ref.count).toBe(1);
  });

  it("shows color picker when swatch is clicked", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} />);
    fireEvent.click(screen.getByLabelText("Open color picker"));
    expect(
      screen.getByRole("application", { name: "Color picker" }),
    ).toBeInTheDocument();
  });

  it("does not open picker when disabled", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} disabled />);
    fireEvent.click(screen.getByLabelText("Open color picker"));
    expect(
      screen.queryByRole("application", { name: "Color picker" }),
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ColorInput
        value={defaultValue}
        onChange={() => {}}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows correct visibility icon based on visible state", () => {
    const { rerender } = render(
      <ColorInput
        value={defaultValue}
        onChange={() => {}}
        showVisibilityToggle
      />,
    );
    expect(screen.getByLabelText("Hide color")).toBeInTheDocument();

    rerender(
      <ColorInput
        value={{ ...defaultValue, visible: false }}
        onChange={() => {}}
        showVisibilityToggle
      />,
    );
    expect(screen.getByLabelText("Show color")).toBeInTheDocument();
  });
});
