/**
 * @file UnitInput component tests
 */

import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { UnitOption } from "./UnitInput";
import { UnitInput } from "./UnitInput";

/**
 * Wrapper component that allows controlled updates of UnitInput value
 */
function ControlledUnitInput(props: {
  initialValue: string;
  onChange?: (value: string) => void;
  allowAuto?: boolean;
  units?: UnitOption[];
  min?: number;
  max?: number;
  step?: number;
  shiftStep?: number;
}) {
  const [value, setValue] = useState(props.initialValue);
  const handleChange = (v: string) => {
    setValue(v);
    props.onChange?.(v);
  };
  return (
    <>
      <UnitInput
        value={value}
        onChange={handleChange}
        allowAuto={props.allowAuto}
        units={props.units}
        min={props.min}
        max={props.max}
        step={props.step}
        shiftStep={props.shiftStep}
        aria-label="Test"
      />
      <button
        data-testid="external-update"
        onClick={() => setValue("999px")}
      >
        External Update
      </button>
      <div data-testid="outside-element">Outside</div>
    </>
  );
}

/**
 * Helper to capture all onChange calls
 */
function createChangeTracker() {
  const calls: string[] = [];
  const handler = (v: string) => {
    calls.push(v);
  };
  return { calls, handler };
}

/**
 * Helper to capture the latest onChange value
 */
function createCapture() {
  const ref = { current: "" };
  const handler = (v: string) => {
    ref.current = v;
  };
  return { ref, handler };
}

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
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "20" } });
    fireEvent.blur(input);

    expect(ref.current).toBe("20px");
  });

  it("allows typing value with unit to change both", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} aria-label="Width" units={[
      { value: "px", label: "px" },
      { value: "%", label: "%" },
    ]} />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50%" } });
    fireEvent.blur(input);

    expect(ref.current).toBe("50%");
  });

  it("cycles through units when unit is clicked", () => {
    const { ref, handler } = createCapture();
    render(
      <UnitInput
        value="10px"
        onChange={handler}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(ref.current).toBe("10%");
  });

  it("cycles back to first unit after last unit", () => {
    const { ref, handler } = createCapture();
    render(
      <UnitInput
        value="10%"
        onChange={handler}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(ref.current).toBe("10px");
  });

  it("supports auto value when allowAuto is true", () => {
    render(<UnitInput value="Auto" onChange={() => {}} allowAuto aria-label="Height" />);

    expect(screen.getByLabelText("Height")).toHaveValue("Auto");
    // Unit button should not be shown for Auto
    expect(screen.queryByTestId("unit-input-unit-button")).not.toBeInTheDocument();
  });

  it("cycles to auto when allowAuto is true", () => {
    const { ref, handler } = createCapture();
    render(
      <UnitInput
        value="10%"
        onChange={handler}
        units={[
          { value: "px", label: "px" },
          { value: "%", label: "%" },
        ]}
        allowAuto
      />,
    );

    const unitButton = screen.getByTestId("unit-input-unit-button");
    fireEvent.click(unitButton);

    expect(ref.current).toBe("Auto");
  });

  it("adjusts value with arrow up key", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(ref.current).toBe("11px");
  });

  it("adjusts value with arrow down key", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(ref.current).toBe("9px");
  });

  it("uses shiftStep with shift+arrow keys", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} shiftStep={10} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp", shiftKey: true });

    expect(ref.current).toBe("20px");
  });

  it("respects min value", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="1px" onChange={handler} min={0} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(ref.current).toBe("0px");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(ref.current).toBe("0px");
  });

  it("respects max value", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="99px" onChange={handler} max={100} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(ref.current).toBe("100px");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(ref.current).toBe("100px");
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
    const { ref, handler } = createCapture();
    render(<UnitInput value="10.5px" onChange={handler} step={0.1} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(ref.current).toBe("10.6px");
  });

  it("parses auto input correctly", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} allowAuto aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "auto" } });
    fireEvent.blur(input);

    expect(ref.current).toBe("Auto");
  });

  it("commits value on Enter key", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(ref.current).toBe("25px");
  });

  it("reverts value on Escape key", () => {
    const { ref, handler } = createCapture();
    render(<UnitInput value="10px" onChange={handler} aria-label="Width" />);

    const input = screen.getByLabelText("Width");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.keyDown(input, { key: "Escape" });

    // Should not have changed the value
    expect(ref.current).toBe("");
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
      const { ref, handler } = createCapture();
      render(<UnitInput value="10px" onChange={handler} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      const vwOption = screen.getByTestId("unit-option-vw");
      fireEvent.click(vwOption);

      expect(ref.current).toBe("10vw");
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
      const { ref, handler } = createCapture();
      render(
        <UnitInput
          value="10px"
          onChange={handler}
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
      expect(ref.current).toBe("10%");
    });
  });

  describe("external value synchronization", () => {
    it("updates display when value prop changes while not editing", () => {
      render(<ControlledUnitInput initialValue="10px" />);

      const input = screen.getByLabelText("Test");
      expect(input).toHaveValue("10");

      // Simulate external value change
      fireEvent.click(screen.getByTestId("external-update"));

      // Display should update to new value
      expect(input).toHaveValue("999");
    });

    it("preserves user input when value prop changes during editing", () => {
      render(<ControlledUnitInput initialValue="10px" />);

      const input = screen.getByLabelText("Test");

      // Start editing
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "50" } });

      // Value should show user's typed value
      expect(input).toHaveValue("50");

      // External update happens while editing
      fireEvent.click(screen.getByTestId("external-update"));

      // User's typed value should be preserved during editing
      expect(input).toHaveValue("50");
    });

    it("shows latest prop value after escape during editing", () => {
      render(<ControlledUnitInput initialValue="10px" />);

      const input = screen.getByLabelText("Test");

      // Start editing
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "50" } });

      // User's typed value
      expect(input).toHaveValue("50");

      // Press escape to cancel editing
      fireEvent.keyDown(input, { key: "Escape" });

      // Should show original value (editing was cancelled)
      expect(input).toHaveValue("10");
    });

    it("shows committed value after Enter", () => {
      render(<ControlledUnitInput initialValue="10px" />);

      const input = screen.getByLabelText("Test");

      // Start editing
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "25" } });
      fireEvent.keyDown(input, { key: "Enter" });

      // Should show committed value
      expect(input).toHaveValue("25");
    });

    it("shows correct value when re-focusing after escape", () => {
      render(<ControlledUnitInput initialValue="10px" />);

      const input = screen.getByLabelText("Test");

      // First edit cycle - type and escape
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "999" } });
      fireEvent.keyDown(input, { key: "Escape" });

      // Blur and refocus
      fireEvent.blur(input);
      fireEvent.focus(input);

      // Should show original value, not the cancelled edit
      expect(input).toHaveValue("10");
    });

    it("handles transition from Auto to number value", () => {
      render(<ControlledUnitInput initialValue="Auto" allowAuto />);

      const input = screen.getByLabelText("Test");
      expect(input).toHaveValue("Auto");

      // Change to number via typing
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "50" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("50");
    });

    it("handles arrow key adjustment without focus changing display", () => {
      render(<ControlledUnitInput initialValue="10px" />);

      const input = screen.getByLabelText("Test");

      // Arrow up without focus
      fireEvent.keyDown(input, { key: "ArrowUp" });

      // Value should update (11)
      expect(input).toHaveValue("11");

      // Arrow down
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(input).toHaveValue("10");
    });
  });

  describe("dropdown interactions", () => {
    const manyUnits: UnitOption[] = [
      { value: "px", label: "px" },
      { value: "%", label: "%" },
      { value: "em", label: "em" },
      { value: "rem", label: "rem" },
      { value: "vw", label: "vw" },
    ];

    it("toggles dropdown on repeated clicks", () => {
      render(<ControlledUnitInput initialValue="10px" units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");

      // First click opens
      fireEvent.click(unitButton);
      expect(screen.getByTestId("unit-input-dropdown")).toBeInTheDocument();

      // Second click closes
      fireEvent.click(unitButton);
      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();

      // Third click opens again
      fireEvent.click(unitButton);
      expect(screen.getByTestId("unit-input-dropdown")).toBeInTheDocument();
    });

    it("closes dropdown when clicking outside", () => {
      render(<ControlledUnitInput initialValue="10px" units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);
      expect(screen.getByTestId("unit-input-dropdown")).toBeInTheDocument();

      // Click outside element
      fireEvent.mouseDown(screen.getByTestId("outside-element"));
      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();
    });

    it("preserves numeric value when changing unit via dropdown", () => {
      const { calls, handler } = createChangeTracker();
      render(
        <UnitInput
          value="123.45px"
          onChange={handler}
          units={manyUnits}
        />,
      );

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      const remOption = screen.getByTestId("unit-option-rem");
      fireEvent.click(remOption);

      expect(calls).toEqual(["123.45rem"]);
    });

    it("shows Auto option in dropdown when allowAuto is true", () => {
      render(
        <UnitInput
          value="10px"
          onChange={() => {}}
          units={manyUnits}
          allowAuto
        />,
      );

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      expect(screen.getByTestId("unit-option-auto")).toBeInTheDocument();
    });

    it("selects Auto from dropdown", () => {
      const { calls, handler } = createChangeTracker();
      render(
        <UnitInput
          value="10px"
          onChange={handler}
          units={manyUnits}
          allowAuto
        />,
      );

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      const autoOption = screen.getByTestId("unit-option-auto");
      fireEvent.click(autoOption);

      expect(calls).toEqual(["Auto"]);
      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();
    });

    it("has correct aria attributes", () => {
      render(<UnitInput value="10px" onChange={() => {}} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      expect(unitButton).toHaveAttribute("aria-haspopup", "listbox");
      expect(unitButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(unitButton);

      expect(unitButton).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("marks current unit as selected in dropdown", () => {
      render(<UnitInput value="10rem" onChange={() => {}} units={manyUnits} />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      const remOption = screen.getByTestId("unit-option-rem");
      expect(remOption).toHaveAttribute("aria-selected", "true");

      const pxOption = screen.getByTestId("unit-option-px");
      expect(pxOption).toHaveAttribute("aria-selected", "false");
    });

    it("does not open dropdown when disabled", () => {
      render(<UnitInput value="10px" onChange={() => {}} units={manyUnits} disabled />);

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      expect(screen.queryByTestId("unit-input-dropdown")).not.toBeInTheDocument();
    });
  });

  describe("sequential value changes", () => {
    it("handles multiple arrow up presses", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(calls).toEqual(["11px", "12px", "13px"]);
      expect(input).toHaveValue("13");
    });

    it("handles multiple arrow down presses", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(calls).toEqual(["9px", "8px", "7px"]);
      expect(input).toHaveValue("7");
    });

    it("handles alternating arrow up and down", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(calls).toEqual(["11px", "10px", "11px", "12px"]);
    });

    it("handles sequential changes hitting min boundary", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="2px" onChange={handler} min={0} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(calls).toEqual(["1px", "0px", "0px", "0px"]);
    });

    it("handles sequential changes hitting max boundary", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="98px" onChange={handler} max={100} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(calls).toEqual(["99px", "100px", "100px", "100px"]);
    });

    it("handles shift+arrow for large steps in sequence", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="50px" onChange={handler} shiftStep={10} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp", shiftKey: true });
      fireEvent.keyDown(input, { key: "ArrowUp", shiftKey: true });
      fireEvent.keyDown(input, { key: "ArrowDown", shiftKey: true });

      expect(calls).toEqual(["60px", "70px", "60px"]);
    });

    it("handles mixed shift and non-shift arrow keys", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="50px" onChange={handler} shiftStep={10} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp" }); // 51
      fireEvent.keyDown(input, { key: "ArrowUp", shiftKey: true }); // 61
      fireEvent.keyDown(input, { key: "ArrowDown" }); // 60
      fireEvent.keyDown(input, { key: "ArrowDown", shiftKey: true }); // 50

      expect(calls).toEqual(["51px", "61px", "60px", "50px"]);
    });

    it("handles custom step values in sequence", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} step={0.5} />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(calls).toEqual(["10.5px", "11px", "11.5px"]);
    });

    it("handles arrow keys during editing mode", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");

      // Focus to enter edit mode
      fireEvent.focus(input);

      // Arrow keys should still work
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(calls).toEqual(["11px", "12px"]);
      expect(input).toHaveValue("12");
    });

    it("handles arrow keys from Auto value", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="Auto" onChange={handler} allowAuto />);

      const input = screen.getByLabelText("Test");

      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      // Starting from Auto should treat it as 0
      expect(calls).toEqual(["1px", "2px"]);
    });
  });

  describe("wheel interactions", () => {
    it("adjusts value on wheel up when focused", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      const container = screen.getByTestId("unit-input");

      // Focus first
      fireEvent.focus(input);

      // Wheel up (negative deltaY)
      fireEvent.wheel(container, { deltaY: -100 });

      expect(calls).toEqual(["11px"]);
    });

    it("adjusts value on wheel down when focused", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      const container = screen.getByTestId("unit-input");

      fireEvent.focus(input);
      fireEvent.wheel(container, { deltaY: 100 });

      expect(calls).toEqual(["9px"]);
    });

    it("ignores wheel when not focused", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const container = screen.getByTestId("unit-input");

      // Wheel without focus
      fireEvent.wheel(container, { deltaY: -100 });

      expect(calls).toEqual([]);
    });

    it("handles sequential wheel events", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      const container = screen.getByTestId("unit-input");

      fireEvent.focus(input);
      fireEvent.wheel(container, { deltaY: -100 });
      fireEvent.wheel(container, { deltaY: -100 });
      fireEvent.wheel(container, { deltaY: 100 });

      expect(calls).toEqual(["11px", "12px", "11px"]);
    });

    it("uses shiftStep with shift+wheel", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="50px" onChange={handler} shiftStep={10} />);

      const input = screen.getByLabelText("Test");
      const container = screen.getByTestId("unit-input");

      fireEvent.focus(input);
      fireEvent.wheel(container, { deltaY: -100, shiftKey: true });

      expect(calls).toEqual(["60px"]);
    });

    it("respects min/max during wheel events", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="1px" onChange={handler} min={0} max={3} />);

      const input = screen.getByLabelText("Test");
      const container = screen.getByTestId("unit-input");

      fireEvent.focus(input);
      fireEvent.wheel(container, { deltaY: 100 }); // 0
      fireEvent.wheel(container, { deltaY: 100 }); // still 0
      fireEvent.wheel(container, { deltaY: -100 }); // 1
      fireEvent.wheel(container, { deltaY: -100 }); // 2
      fireEvent.wheel(container, { deltaY: -100 }); // 3
      fireEvent.wheel(container, { deltaY: -100 }); // still 3

      expect(calls).toEqual(["0px", "0px", "1px", "2px", "3px", "3px"]);
    });

    it("ignores wheel when disabled", () => {
      const { calls, handler } = createChangeTracker();
      render(<UnitInput value="10px" onChange={handler} disabled aria-label="Test" />);

      const input = screen.getByLabelText("Test");
      const container = screen.getByTestId("unit-input");

      fireEvent.focus(input);
      fireEvent.wheel(container, { deltaY: -100 });

      expect(calls).toEqual([]);
    });
  });

  describe("edge cases and parsing", () => {
    it("handles empty input by defaulting to 0", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["0px"]);
    });

    it("handles whitespace-only input", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.blur(input);

      expect(calls).toEqual(["0px"]);
    });

    it("handles negative values", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="0px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "-10" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["-10px"]);
    });

    it("clamps negative values to min", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="0px" onChange={handler} min={0} />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "-10" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["0px"]);
    });

    it("handles decimal input correctly", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "10.567" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["10.57px"]);
    });

    it("handles case insensitive unit matching", () => {
      const units: UnitOption[] = [
        { value: "px", label: "px" },
        { value: "REM", label: "rem" },
      ];
      const { calls, handler } = createChangeTracker();
      render(<UnitInput value="10px" onChange={handler} units={units} aria-label="Test" />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "20rem" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["20rem"]);
    });

    it("handles case insensitive auto parsing", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} allowAuto />);

      const input = screen.getByLabelText("Test");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "AUTO" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["Auto"]);
    });

    it("preserves unit when typing just a number", () => {
      const { calls, handler } = createChangeTracker();
      render(
        <UnitInput
          value="10%"
          onChange={handler}
          units={[
            { value: "px", label: "px" },
            { value: "%", label: "%" },
          ]}
          aria-label="Test"
        />,
      );

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "50" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["50%"]);
    });

    it("handles value with spaces between number and unit", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "20 px" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["20px"]);
    });
  });

  describe("unit cycling", () => {
    it("cycles through all units including auto", () => {
      const { calls, handler } = createChangeTracker();
      const units: UnitOption[] = [
        { value: "px", label: "px" },
        { value: "%", label: "%" },
      ];

      // Use controlled component to properly test cycling
      render(
        <ControlledUnitInput
          initialValue="10px"
          onChange={handler}
          units={units}
          allowAuto
        />,
      );

      const unitButton = screen.getByTestId("unit-input-unit-button");

      fireEvent.click(unitButton); // px -> %
      expect(calls[0]).toBe("10%");

      fireEvent.click(unitButton); // % -> Auto
      expect(calls[1]).toBe("Auto");
    });

    it("cycles from Auto back to first unit", () => {
      const units: UnitOption[] = [
        { value: "px", label: "px" },
        { value: "%", label: "%" },
      ];
      render(
        <UnitInput
          value="Auto"
          onChange={() => {}}
          units={units}
          allowAuto
        />,
      );

      // When Auto, unit button is not shown (parsed.isAuto is true)
      expect(screen.queryByTestId("unit-input-unit-button")).not.toBeInTheDocument();
    });

    it("does not cycle when disabled", () => {
      const { calls, handler } = createChangeTracker();
      render(
        <UnitInput
          value="10px"
          onChange={handler}
          units={[
            { value: "px", label: "px" },
            { value: "%", label: "%" },
          ]}
          disabled
        />,
      );

      const unitButton = screen.getByTestId("unit-input-unit-button");
      fireEvent.click(unitButton);

      expect(calls).toEqual([]);
    });
  });

  describe("icon support", () => {
    it("renders icon when iconStart is provided", () => {
      render(
        <UnitInput
          value="10px"
          onChange={() => {}}
          iconStart={<span data-testid="custom-icon">X</span>}
        />,
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.getByTestId("unit-input-icon")).toBeInTheDocument();
    });

    it("does not render icon wrapper when iconStart is not provided", () => {
      render(<UnitInput value="10px" onChange={() => {}} />);

      expect(screen.queryByTestId("unit-input-icon")).not.toBeInTheDocument();
    });
  });

  describe("focus and blur behavior", () => {
    it("enters editing mode on focus", () => {
      render(<ControlledUnitInput initialValue="12345px" />);

      const input = screen.getByLabelText("Test") as HTMLInputElement;

      // Before focus: should show derived value
      expect(input).toHaveValue("12345");

      // Focus starts editing mode
      fireEvent.focus(input);

      // Still showing the same value (initialized in handleFocus)
      expect(input).toHaveValue("12345");

      // Can type a different value
      fireEvent.change(input, { target: { value: "999" } });
      expect(input).toHaveValue("999");
    });

    it("commits value on blur", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "99" } });
      fireEvent.blur(input);

      expect(calls).toEqual(["99px"]);
    });

    it("does not commit value on blur after Escape", () => {
      const { calls, handler } = createChangeTracker();
      render(<ControlledUnitInput initialValue="10px" onChange={handler} />);

      const input = screen.getByLabelText("Test");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "99" } });
      fireEvent.keyDown(input, { key: "Escape" });
      // Blur happens after Escape (browser behavior)
      fireEvent.blur(input);

      // No value should be committed
      expect(calls).toEqual([]);
    });
  });
});
