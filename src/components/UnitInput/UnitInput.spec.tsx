/**
 * @file UnitInput component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { UnitInput } from "./UnitInput";

describe("UnitInput", () => {
  it("renders with initial value showing only the number", () => {
    render(<UnitInput value="10px" onChange={() => {}} aria-label="Width" />);
    // Should show just "10" in the input, not "10px"
    expect(screen.getByLabelText("Width")).toHaveValue("10");
  });

  it("renders unit as separate element", () => {
    render(<UnitInput value="10px" onChange={() => {}} />);
    expect(screen.getByTestId("unit-input-unit-button")).toHaveTextContent("px");
  });

  it("calls onChange with full value when input changes", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "20" } });
    fireEvent.blur(input);

    expect(captured).toBe("20px");
  });

  it("allows typing value with unit to change both", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" units={[
      { value: "px", label: "px" },
      { value: "%", label: "%" },
    ]} />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50%" } });
    fireEvent.blur(input);

    expect(captured).toBe("50%");
  });

  it("cycles through units when unit is clicked", () => {
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
    // Unit button should not be shown for Auto
    expect(screen.queryByTestId("unit-input-unit-button")).not.toBeInTheDocument();
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
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(captured).toBe("0px");

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
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(captured).toBe("100px");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(captured).toBe("100px");
  });

  it("is disabled when disabled prop is true", () => {
    render(<UnitInput value="10px" onChange={() => {}} disabled aria-label="Width" />);

    expect(screen.getByLabelText("Width")).toBeDisabled();
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
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "auto" } });
    fireEvent.blur(input);

    expect(captured).toBe("Auto");
  });

  it("commits value on Enter key", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(captured).toBe("25px");
  });

  it("reverts value on Escape key", () => {
    // eslint-disable-next-line no-restricted-syntax
    let captured = "";
    const handleChange = (v: string) => {
      captured = v;
    };
    render(<UnitInput value="10px" onChange={handleChange} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.keyDown(input, { key: "Escape" });

    // Should not have changed the value
    expect(captured).toBe("");
  });

  describe("dropdown mode (5+ units)", () => {
    const manyUnits = [
      { value: "px", label: "px" },
      { value: "%", label: "%" },
      { value: "em", label: "em" },
      { value: "rem", label: "rem" },
      { value: "vw", label: "vw" },
    ];

    it("shows dropdown when clicking unit button with 5+ units", () => {
      render(<UnitInput value="10px" onChange={() => {}} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      expect(screen.getByTestId("unit-input-dropdown")).toBeInTheDocument();
    });

    it("shows all unit options in dropdown", () => {
      render(<UnitInput value="10px" onChange={() => {}} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      expect(screen.getByTestId("unit-option-px")).toBeInTheDocument();
      expect(screen.getByTestId("unit-option-%")).toBeInTheDocument();
      expect(screen.getByTestId("unit-option-em")).toBeInTheDocument();
      expect(screen.getByTestId("unit-option-rem")).toBeInTheDocument();
      expect(screen.getByTestId("unit-option-vw")).toBeInTheDocument();
    });

    it("selects unit from dropdown", () => {
      // eslint-disable-next-line no-restricted-syntax
      let captured = "";
      const handleChange = (v: string) => {
        captured = v;
      };
      render(<UnitInput value="10px" onChange={handleChange} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      const vwOption = screen.getByTestId("unit-option-vw");
      fireEvent.click(vwOption);

      expect(captured).toBe("10vw");
      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();
    });

    it("closes dropdown on escape key", () => {
      render(<UnitInput value="10px" onChange={() => {}} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      expect(screen.getByTestId("unit-input-dropdown")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();
    });

    it("still cycles when units < 5", () => {
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

      // Should cycle, not show dropdown
      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();
      expect(captured).toBe("10%");
    });
  });
});
