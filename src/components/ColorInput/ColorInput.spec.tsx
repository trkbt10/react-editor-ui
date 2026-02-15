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

  it("renders visibility toggle by default", () => {
    render(<ColorInput value={defaultValue} onChange={() => {}} />);
    expect(screen.getByLabelText("Hide color")).toBeInTheDocument();
  });

  it("hides visibility toggle when showVisibilityToggle is false", () => {
    render(
      <ColorInput
        value={defaultValue}
        onChange={() => {}}
        showVisibilityToggle={false}
      />,
    );
    expect(screen.queryByLabelText("Hide color")).not.toBeInTheDocument();
  });

  it("renders remove button when showRemove is true", () => {
    render(
      <ColorInput value={defaultValue} onChange={() => {}} showRemove />,
    );
    expect(screen.getByLabelText("Remove color")).toBeInTheDocument();
  });

  it("calls onChange when hex input changes", () => {
    let changedHex = "";
    const handleChange = (v: ColorValue) => {
      changedHex = v.hex;
    };
    render(<ColorInput value={defaultValue} onChange={handleChange} />);
    const hexInput = screen.getByLabelText("Hex color");
    fireEvent.change(hexInput, { target: { value: "00ff00" } });
    expect(changedHex).toBe("#00ff00");
  });

  it("calls onChange when opacity input changes", () => {
    let changedOpacity = -1;
    const handleChange = (v: ColorValue) => {
      changedOpacity = v.opacity;
    };
    render(<ColorInput value={defaultValue} onChange={handleChange} />);
    const opacityInput = screen.getByLabelText("Opacity");
    fireEvent.change(opacityInput, { target: { value: "50" } });
    expect(changedOpacity).toBe(50);
  });

  it("calls onChange when visibility toggle is clicked", () => {
    let changedVisible = true;
    const handleChange = (v: ColorValue) => {
      changedVisible = v.visible;
    };
    render(<ColorInput value={defaultValue} onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText("Hide color"));
    expect(changedVisible).toBe(false);
  });

  it("calls onRemove when remove button is clicked", () => {
    let removeCount = 0;
    const handleRemove = () => {
      removeCount += 1;
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
    expect(removeCount).toBe(1);
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
      <ColorInput value={defaultValue} onChange={() => {}} />,
    );
    expect(screen.getByLabelText("Hide color")).toBeInTheDocument();

    rerender(
      <ColorInput
        value={{ ...defaultValue, visible: false }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText("Show color")).toBeInTheDocument();
  });
});
