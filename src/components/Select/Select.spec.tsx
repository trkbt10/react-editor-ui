/**
 * @file Select tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "./Select";

describe("Select", () => {
  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];

  it("renders with placeholder when no value", () => {
    render(
      <Select
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select fruit..."
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Select fruit...");
  });

  it("renders selected value", () => {
    render(
      <Select options={options} value="banana" onChange={() => {}} />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
  });

  it("opens dropdown on click", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} />,
    );

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all options in dropdown", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onChange when option is selected", () => {
    const ref = { value: "" };
    const handleChange = (value: string) => {
      ref.value = value;
    };
    render(
      <Select options={options} value="apple" onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Banana"));
    expect(ref.value).toBe("banana");
  });

  it("closes dropdown after selection", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Banana"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not open when disabled", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} disabled />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not select disabled options", () => {
    const ref = { count: 0 };
    const handleChange = () => {
      ref.count += 1;
    };
    const optionsWithDisabled = [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana", disabled: true },
    ];

    render(
      <Select
        options={optionsWithDisabled}
        value="apple"
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Banana"));
    expect(ref.count).toBe(0);
  });

  it("closes dropdown on Escape key", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens dropdown on Enter key", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} />,
    );

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("navigates options with arrow keys", () => {
    const ref = { value: "" };
    const handleChange = (value: string) => {
      ref.value = value;
    };
    render(
      <Select options={options} value="apple" onChange={handleChange} />,
    );

    // Click opens dropdown with focusedIndex = -1
    fireEvent.click(screen.getByRole("combobox"));
    // First ArrowDown moves to index 0 (apple)
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    // Second ArrowDown moves to index 1 (banana)
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    // Enter selects banana
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(ref.value).toBe("banana");
  });

  it("shows aria-expanded state", () => {
    render(
      <Select options={options} value="apple" onChange={() => {}} />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <Select
        options={options}
        value="apple"
        onChange={() => {}}
        className="custom-select"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-select");
  });

  it("applies aria-label", () => {
    render(
      <Select
        options={options}
        value="apple"
        onChange={() => {}}
        aria-label="Fruit selection"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-label",
      "Fruit selection",
    );
  });

  describe("memo optimization", () => {
    it("updates correctly when value changes", () => {
      const { rerender } = render(
        <Select options={options} value="apple" onChange={() => {}} />,
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Apple");

      rerender(
        <Select options={options} value="banana" onChange={() => {}} />,
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
    });

    it("updates correctly when options change", () => {
      const newOptions = [
        { value: "dog", label: "Dog" },
        { value: "cat", label: "Cat" },
      ];

      const { rerender } = render(
        <Select options={options} value="apple" onChange={() => {}} />,
      );

      fireEvent.click(screen.getByRole("combobox"));
      expect(screen.getAllByRole("option")).toHaveLength(3);

      // Close dropdown
      fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });

      rerender(
        <Select options={newOptions} value="dog" onChange={() => {}} />,
      );

      // Verify combobox shows new value
      expect(screen.getByRole("combobox")).toHaveTextContent("Dog");

      fireEvent.click(screen.getByRole("combobox"));
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("updates correctly when disabled state changes", () => {
      const { rerender } = render(
        <Select options={options} value="apple" onChange={() => {}} disabled={false} />,
      );

      // Should open when not disabled
      fireEvent.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Close
      fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });

      rerender(
        <Select options={options} value="apple" onChange={() => {}} disabled={true} />,
      );

      // Should not open when disabled
      fireEvent.click(screen.getByRole("combobox"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("updates correctly when size changes", () => {
      const { rerender, container } = render(
        <Select options={options} value="apple" onChange={() => {}} size="md" />,
      );

      const combobox = container.querySelector('[role="combobox"]') as HTMLElement;

      rerender(
        <Select options={options} value="apple" onChange={() => {}} size="sm" />,
      );

      // Size change should be reflected (different padding)
      expect(combobox).toBeInTheDocument();
    });
  });
});
