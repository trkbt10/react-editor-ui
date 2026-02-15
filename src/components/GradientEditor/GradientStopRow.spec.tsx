/**
 * @file GradientStopRow component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { GradientStopRow } from "./GradientStopRow";
import type { GradientStop } from "./gradientTypes";

const createTestStop = (): GradientStop => ({
  id: "stop-1",
  position: 50,
  color: { hex: "#ff0000", opacity: 100, visible: true },
});

describe("GradientStopRow", () => {
  it("renders with stop values", () => {
    const stop = createTestStop();
    render(
      <GradientStopRow
        stop={stop}
        onChange={() => {}}
        onRemove={() => {}}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const positionInput = screen.getByRole("textbox", { name: "Position" });
    expect(positionInput).toHaveValue("50");

    const hexInput = screen.getByRole("textbox", { name: "Hex color" });
    expect(hexInput).toHaveValue("ff0000");

    const opacityInput = screen.getByRole("textbox", { name: "Opacity" });
    expect(opacityInput).toHaveValue("100");
  });

  it("calls onChange when position is updated", () => {
    const stop = createTestStop();
    let updatedStop = stop;
    const handleChange = (s: GradientStop) => {
      updatedStop = s;
    };

    render(
      <GradientStopRow
        stop={stop}
        onChange={handleChange}
        onRemove={() => {}}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const positionInput = screen.getByRole("textbox", { name: "Position" });
    fireEvent.change(positionInput, { target: { value: "75" } });

    expect(updatedStop.position).toBe(75);
  });

  it("calls onChange when hex is updated", () => {
    const stop = createTestStop();
    let updatedStop = stop;
    const handleChange = (s: GradientStop) => {
      updatedStop = s;
    };

    render(
      <GradientStopRow
        stop={stop}
        onChange={handleChange}
        onRemove={() => {}}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const hexInput = screen.getByRole("textbox", { name: "Hex color" });
    fireEvent.change(hexInput, { target: { value: "00ff00" } });

    expect(updatedStop.color.hex).toBe("#00ff00");
  });

  it("calls onChange when opacity is updated", () => {
    const stop = createTestStop();
    let updatedStop = stop;
    const handleChange = (s: GradientStop) => {
      updatedStop = s;
    };

    render(
      <GradientStopRow
        stop={stop}
        onChange={handleChange}
        onRemove={() => {}}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const opacityInput = screen.getByRole("textbox", { name: "Opacity" });
    fireEvent.change(opacityInput, { target: { value: "50" } });

    expect(updatedStop.color.opacity).toBe(50);
  });

  it("calls onRemove when delete button is clicked", () => {
    const stop = createTestStop();
    let removed = false;
    const handleRemove = () => {
      removed = true;
    };

    render(
      <GradientStopRow
        stop={stop}
        onChange={() => {}}
        onRemove={handleRemove}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Remove stop" });
    fireEvent.click(deleteButton);

    expect(removed).toBe(true);
  });

  it("calls onSelect when row is clicked", () => {
    const stop = createTestStop();
    let selected = false;
    const handleSelect = () => {
      selected = true;
    };

    render(
      <GradientStopRow
        stop={stop}
        onChange={() => {}}
        onRemove={() => {}}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );

    const row = screen.getByRole("row");
    fireEvent.click(row);

    expect(selected).toBe(true);
  });

  it("disables remove button when removeDisabled is true", () => {
    const stop = createTestStop();
    let removed = false;
    const handleRemove = () => {
      removed = true;
    };

    render(
      <GradientStopRow
        stop={stop}
        onChange={() => {}}
        onRemove={handleRemove}
        isSelected={false}
        onSelect={() => {}}
        removeDisabled
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Remove stop" });
    fireEvent.click(deleteButton);

    expect(removed).toBe(false);
  });

  it("reverts invalid position on blur", () => {
    const stop = createTestStop();
    render(
      <GradientStopRow
        stop={stop}
        onChange={() => {}}
        onRemove={() => {}}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    const positionInput = screen.getByRole("textbox", { name: "Position" });
    fireEvent.change(positionInput, { target: { value: "150" } });
    fireEvent.blur(positionInput);

    expect(positionInput).toHaveValue("50");
  });
});
