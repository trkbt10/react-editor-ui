/**
 * @file SegmentedControl component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentedControl } from "./SegmentedControl";

describe("SegmentedControl", () => {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];

  it("renders all options", () => {
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("marks selected option with aria-checked", () => {
    render(
      <SegmentedControl
        options={options}
        value="b"
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    const optionB = screen.getByRole("radio", { name: "Option B" });
    expect(optionB).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when option clicked", () => {
    const ref = { value: null as string | string[] | null };
    const handleChange = (v: string | string[]) => {
      ref.value = v;
    };
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={handleChange}
        aria-label="Test"
      />,
    );
    fireEvent.click(screen.getByText("Option B"));
    expect(ref.value).toBe("b");
  });

  it("does not call onChange when disabled option clicked", () => {
    const ref = { value: 0 };
    const handleChange = () => {
      ref.value += 1;
    };
    const optionsWithDisabled = [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B", disabled: true },
    ];
    render(
      <SegmentedControl
        options={optionsWithDisabled}
        value="a"
        onChange={handleChange}
        aria-label="Test"
      />,
    );
    fireEvent.click(screen.getByText("Option B"));
    expect(ref.value).toBe(0);
  });

  it("does not call onChange when control is disabled", () => {
    const ref = { value: 0 };
    const handleChange = () => {
      ref.value += 1;
    };
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={handleChange}
        disabled
        aria-label="Test"
      />,
    );
    fireEvent.click(screen.getByText("Option B"));
    expect(ref.value).toBe(0);
  });

  it("supports multiple selection", () => {
    const ref = { value: null as string | string[] | null };
    const handleChange = (v: string | string[]) => {
      ref.value = v;
    };
    render(
      <SegmentedControl
        options={options}
        value={["a"]}
        onChange={handleChange}
        multiple
        aria-label="Test"
      />,
    );

    fireEvent.click(screen.getByText("Option B"));
    expect(ref.value).toEqual(["a", "b"]);
  });

  it("supports deselecting in multiple mode", () => {
    const ref = { value: null as string | string[] | null };
    const handleChange = (v: string | string[]) => {
      ref.value = v;
    };
    render(
      <SegmentedControl
        options={options}
        value={["a", "b"]}
        onChange={handleChange}
        multiple
        aria-label="Test"
      />,
    );

    fireEvent.click(screen.getByText("Option A"));
    expect(ref.value).toEqual(["b"]);
  });

  it("renders with icons", () => {
    const iconOptions = [
      {
        value: "icon",
        icon: <span data-testid="test-icon">Icon</span>,
        label: "With Icon",
      },
    ];
    render(
      <SegmentedControl
        options={iconOptions}
        value="icon"
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={() => {}}
        className="custom-class"
        aria-label="Test"
      />,
    );
    expect(screen.getByRole("group")).toHaveClass("custom-class");
  });

  it("uses checkbox role in multiple mode", () => {
    render(
      <SegmentedControl
        options={options}
        value={["a"]}
        onChange={() => {}}
        multiple
        aria-label="Test"
      />,
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("uses radio role in single mode", () => {
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("applies fullWidth style when fullWidth is true", () => {
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={() => {}}
        fullWidth
        aria-label="Test"
      />,
    );
    const container = screen.getByRole("group");
    expect(container.style.width).toBe("100%");
  });

  it("has auto width when fullWidth is false", () => {
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    const container = screen.getByRole("group");
    expect(container.style.width).toBe("auto");
  });

  it("buttons have flex for equal width", () => {
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={() => {}}
        aria-label="Test"
      />,
    );
    const buttons = screen.getAllByRole("radio");
    buttons.forEach((button) => {
      expect(button.style.flex).toContain("1");
    });
  });
});
