/**
 * @file UnitDropdown component tests
 */

import { useRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnitDropdown } from "./UnitDropdown";
import type { UnitOption } from "./unitInputUtils";

const defaultOptions: UnitOption[] = [
  { value: "px", label: "px" },
  { value: "%", label: "%" },
  { value: "em", label: "em" },
];

function TestWrapper({
  options = defaultOptions,
  selectedValue = "px",
  onSelect = () => {},
  onClose = () => {},
}: {
  options?: UnitOption[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  onClose?: () => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={anchorRef} data-testid="anchor">
        Anchor
      </button>
      <UnitDropdown
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        onClose={onClose}
        anchorRef={anchorRef}
        fontSize="12px"
      />
      <div data-testid="outside">Outside</div>
    </>
  );
}

describe("UnitDropdown", () => {
  it("renders all options", () => {
    render(<TestWrapper />);

    expect(screen.getByTestId("unit-option-px")).toBeInTheDocument();
    expect(screen.getByTestId("unit-option-%")).toBeInTheDocument();
    expect(screen.getByTestId("unit-option-em")).toBeInTheDocument();
  });

  it("marks selected option with aria-selected", () => {
    render(<TestWrapper selectedValue="%" />);

    expect(screen.getByTestId("unit-option-%")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("unit-option-px")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("unit-option-em")).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelect when option is clicked", () => {
    const onSelect = vi.fn();
    render(<TestWrapper onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId("unit-option-em"));

    expect(onSelect).toHaveBeenCalledWith("em");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when pointer down outside", () => {
    const onClose = vi.fn();
    render(<TestWrapper onClose={onClose} />);

    fireEvent.pointerDown(screen.getByTestId("outside"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when pointer down inside dropdown", () => {
    const onClose = vi.fn();
    render(<TestWrapper onClose={onClose} />);

    fireEvent.pointerDown(screen.getByTestId("unit-option-px"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when pointer down on anchor", () => {
    const onClose = vi.fn();
    render(<TestWrapper onClose={onClose} />);

    fireEvent.pointerDown(screen.getByTestId("anchor"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<TestWrapper onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has correct aria attributes", () => {
    render(<TestWrapper />);

    const dropdown = screen.getByRole("listbox");
    expect(dropdown).toHaveAttribute("aria-label", "Select unit");
  });

  it("renders options with correct labels", () => {
    const options: UnitOption[] = [
      { value: "rem", label: "REM" },
      { value: "vw", label: "Viewport Width" },
    ];
    render(<TestWrapper options={options} selectedValue="rem" />);

    expect(screen.getByTestId("unit-option-rem")).toHaveTextContent("REM");
    expect(screen.getByTestId("unit-option-vw")).toHaveTextContent("Viewport Width");
  });

  it("handles case-insensitive selection matching", () => {
    render(<TestWrapper selectedValue="PX" />);

    expect(screen.getByTestId("unit-option-px")).toHaveAttribute("aria-selected", "true");
  });

  it("renders with single option", () => {
    const options: UnitOption[] = [{ value: "px", label: "px" }];
    render(<TestWrapper options={options} />);

    expect(screen.getByTestId("unit-option-px")).toBeInTheDocument();
  });

  it("renders with empty options", () => {
    render(<TestWrapper options={[]} />);

    const dropdown = screen.getByRole("listbox");
    expect(dropdown.children).toHaveLength(0);
  });

  it("cleans up event listeners on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = render(<TestWrapper onClose={onClose} />);

    // Unmount the component
    unmount();

    // Event listeners should be cleaned up - these should not trigger onClose
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("handles multiple sequential selections", () => {
    const onSelect = vi.fn();
    const { rerender } = render(<TestWrapper onSelect={onSelect} selectedValue="px" />);

    fireEvent.click(screen.getByTestId("unit-option-%"));
    expect(onSelect).toHaveBeenCalledWith("%");

    // Rerender with new selected value
    rerender(<TestWrapper onSelect={onSelect} selectedValue="%" />);

    fireEvent.click(screen.getByTestId("unit-option-em"));
    expect(onSelect).toHaveBeenCalledWith("em");

    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("does not call onClose for other keys", () => {
    const onClose = vi.fn();
    render(<TestWrapper onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Tab" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("supports special characters in option values", () => {
    const options: UnitOption[] = [
      { value: "%", label: "Percent" },
      { value: "deg", label: "Degrees" },
    ];
    const onSelect = vi.fn();
    render(<TestWrapper options={options} onSelect={onSelect} selectedValue="%" />);

    expect(screen.getByTestId("unit-option-%")).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByTestId("unit-option-deg"));
    expect(onSelect).toHaveBeenCalledWith("deg");
  });
});
