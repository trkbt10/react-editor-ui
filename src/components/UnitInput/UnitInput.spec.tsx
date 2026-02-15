/**
 * @file UnitInput component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { UnitInput } from "./UnitInput";

describe("UnitInput", () => {
  it("renders with initial value", () => {
    render(<UnitInput value="10px" onChange={() => {}} aria-label="Width" />);
    expect(screen.getByLabelText("Width")).toHaveValue("10px");
  });

  it("renders unit button with current unit", () => {
    render(<UnitInput value="10px" onChange={() => {}} />);
    expect(screen.getByTestId("unit-input-unit-button")).toHaveTextContent("px");
  });

  it("calls onChange when input value changes", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.change(input, { target: { value: "20px" } });

    expect(captured).toBe("20px");
  });

  it("cycles through units when unit button is clicked", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(
      <UnitInput
        value="10px"
        onChange={handleChange}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(captured).toBe("10%");
  });

  it("cycles back to first unit after last unit", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(
      <UnitInput
        value="10%"
        onChange={handleChange}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(captured).toBe("10px");
  });

  it("supports auto value when allowAuto is true", () => {
    render(<UnitInput value="Auto" onChange={() => {}} allowAuto aria-label="Height" />);

    expect(screen.getByLabelText("Height")).toHaveValue("Auto");
    expect(screen.getByTestId("unit-input-unit-button")).toHaveTextContent("Auto");
  });

  it("cycles to auto when allowAuto is true", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(
      <UnitInput
        value="10%"
        onChange={handleChange}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
        allowAuto
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(captured).toBe("Auto");
  });

  it("cycles from auto back to first unit", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(
      <UnitInput
        value="Auto"
        onChange={handleChange}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
        allowAuto
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(captured).toBe("0px");
  });

  it("adjusts value with arrow up key", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(captured).toBe("11px");
  });

  it("adjusts value with arrow down key", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(captured).toBe("9px");
  });

  it("uses shiftStep with shift+arrow keys", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} shiftStep={10} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp", shiftKey: true });

    expect(captured).toBe("20px");
  });

  it("respects min value", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="1px" onChange={handleChange} min={0} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    // 1 - 1 = 0
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(captured).toBe("0px");

    // 0 - 1 should still be 0 due to min constraint
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(captured).toBe("0px");
  });

  it("respects max value", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="99px" onChange={handleChange} max={100} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    // 99 + 1 = 100
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(captured).toBe("100px");

    // 100 + 1 should still be 100 due to max constraint
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(captured).toBe("100px");
  });

  it("is disabled when disabled prop is true", () => {
    render(<UnitInput value="10px" onChange={() => {}} disabled aria-label="Width" />);

    expect(screen.getByLabelText("Width")).toBeDisabled();
    expect(screen.getByTestId("unit-input-unit-button")).toBeDisabled();
  });

  it("applies className to container", () => {
    render(<UnitInput value="10px" onChange={() => {}} className="custom-class" />);

    expect(screen.getByTestId("unit-input")).toHaveClass("custom-class");
  });

  it("displays placeholder when empty", () => {
    render(<UnitInput value="" onChange={() => {}} placeholder="Enter value" aria-label="Width" />);

    expect(screen.getByLabelText("Width")).toHaveAttribute("placeholder", "Enter value");
  });

  it("handles decimal values", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10.5px" onChange={handleChange} step={0.1} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(captured).toBe("10.6px");
  });

  it("parses auto input correctly", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} allowAuto aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.change(input, { target: { value: "auto" } });

    expect(captured).toBe("Auto");
  });
});
