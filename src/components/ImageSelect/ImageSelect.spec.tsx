/**
 * @file ImageSelect component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ImageSelect } from "./ImageSelect";

function createTracker<T>() {
  const calls: T[] = [];
  const fn = (value: T) => {
    calls.push(value);
  };
  return { fn, calls };
}

describe("ImageSelect", () => {
  const defaultOptions = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("renders with placeholder when no selection", () => {
    render(
      <ImageSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
        placeholder="Select an option"
        aria-label="Test select"
      />,
    );

    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("renders selected option label", () => {
    render(
      <ImageSelect
        options={defaultOptions}
        value="opt2"
        onChange={() => {}}
        aria-label="Test select"
      />,
    );

    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    render(
      <ImageSelect
        options={defaultOptions}
        value="opt1"
        onChange={() => {}}
        aria-label="Test select"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onChange when option is selected", () => {
    const { fn: handleChange, calls } = createTracker<string>();
    render(
      <ImageSelect
        options={defaultOptions}
        value="opt1"
        onChange={handleChange}
        aria-label="Test select"
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option 2"));

    expect(calls).toEqual(["opt2"]);
  });

  it("renders with image options", () => {
    const imageOptions = [
      { value: "img1", image: <div data-testid="image-1">Image 1</div> },
      { value: "img2", image: <div data-testid="image-2">Image 2</div> },
    ];

    render(
      <ImageSelect
        options={imageOptions}
        value="img1"
        onChange={() => {}}
        aria-label="Image select"
      />,
    );

    expect(screen.getByTestId("image-1")).toBeInTheDocument();
  });

  it("shows image in dropdown", () => {
    const imageOptions = [
      { value: "img1", image: <div data-testid="image-1">Image 1</div> },
      { value: "img2", image: <div data-testid="image-2">Image 2</div> },
    ];

    render(
      <ImageSelect
        options={imageOptions}
        value="img1"
        onChange={() => {}}
        aria-label="Image select"
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByTestId("image-2")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <ImageSelect
        options={defaultOptions}
        value="opt1"
        onChange={() => {}}
        disabled
        aria-label="Test select"
      />,
    );

    const button = screen.getByRole("combobox");
    expect(button).toBeDisabled();
  });

  it("does not call onChange for disabled options", () => {
    const { fn: handleChange, calls } = createTracker<string>();
    const optionsWithDisabled = [
      { value: "opt1", label: "Option 1" },
      { value: "opt2", label: "Option 2", disabled: true },
    ];

    render(
      <ImageSelect
        options={optionsWithDisabled}
        value="opt1"
        onChange={handleChange}
        aria-label="Test select"
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option 2"));

    expect(calls.length).toBe(0);
  });

  it("handles keyboard navigation", () => {
    const { fn: handleChange, calls } = createTracker<string>();
    render(
      <ImageSelect
        options={defaultOptions}
        value="opt1"
        onChange={handleChange}
        aria-label="Test select"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.keyDown(button, { key: "ArrowDown" });

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(button, { key: "ArrowDown" });
    fireEvent.keyDown(button, { key: "Enter" });

    expect(calls).toEqual(["opt2"]);
  });

  it("closes on Escape key", () => {
    render(
      <ImageSelect
        options={defaultOptions}
        value="opt1"
        onChange={() => {}}
        aria-label="Test select"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(button, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
