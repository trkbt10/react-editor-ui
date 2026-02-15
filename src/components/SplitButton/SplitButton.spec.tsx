/**
 * @file SplitButton component tests
 */

import { render, fireEvent, screen } from "@testing-library/react";
import { SplitButton, type SplitButtonOption } from "./SplitButton";

function PlayIcon() {
  return <svg data-testid="play-icon" />;
}

function PreviewIcon() {
  return <svg data-testid="preview-icon" />;
}

const defaultOptions: SplitButtonOption[] = [
  { value: "present", label: "Present", icon: <PlayIcon />, shortcut: "⌥⌘↵" },
  { value: "preview", label: "Preview", icon: <PreviewIcon />, shortcut: "⇧Space" },
];

describe("SplitButton", () => {
  it("renders with selected option icon", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
      />
    );

    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });

  it("calls onAction when main button is clicked", () => {
    let actionCount = 0;
    const handleAction = () => {
      actionCount += 1;
    };
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
        onAction={handleAction}
      />
    );

    const mainButton = screen.getByLabelText("Present");
    fireEvent.click(mainButton);
    expect(actionCount).toBe(1);
  });

  it("opens dropdown when chevron button is clicked", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("shows keyboard shortcuts in dropdown", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);

    expect(screen.getByText("⌥⌘↵")).toBeInTheDocument();
    expect(screen.getByText("⇧Space")).toBeInTheDocument();
  });

  it("calls onChange when option is selected", () => {
    let selectedValue = "";
    const handleChange = (value: string) => {
      selectedValue = value;
    };
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={handleChange}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);

    const previewOption = screen.getByRole("option", { name: /Preview/i });
    fireEvent.click(previewOption);

    expect(selectedValue).toBe("preview");
  });

  it("closes dropdown after selection", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const previewOption = screen.getByRole("option", { name: /Preview/i });
    fireEvent.click(previewOption);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not call onChange for disabled option", () => {
    let changeCount = 0;
    const handleChange = () => {
      changeCount += 1;
    };
    const optionsWithDisabled: SplitButtonOption[] = [
      { value: "present", label: "Present", icon: <PlayIcon /> },
      { value: "preview", label: "Preview", icon: <PreviewIcon />, disabled: true },
    ];

    render(
      <SplitButton
        options={optionsWithDisabled}
        value="present"
        onChange={handleChange}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);

    const previewOption = screen.getByRole("option", { name: /Preview/i });
    fireEvent.click(previewOption);

    expect(changeCount).toBe(0);
  });

  it("is disabled when disabled prop is true", () => {
    let actionCount = 0;
    const handleAction = () => {
      actionCount += 1;
    };

    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
        onAction={handleAction}
        disabled
      />
    );

    const mainButton = screen.getByLabelText("Present");
    const dropdownButton = screen.getByLabelText("Open menu");

    expect(mainButton).toBeDisabled();
    expect(dropdownButton).toBeDisabled();

    fireEvent.click(mainButton);
    fireEvent.click(dropdownButton);

    expect(actionCount).toBe(0);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape key", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(dropdownButton, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation", () => {
    let selectedValue = "";
    const handleChange = (value: string) => {
      selectedValue = value;
    };
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={handleChange}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");

    // Open with ArrowDown
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Navigate down
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });

    // Select with Enter
    fireEvent.keyDown(dropdownButton, { key: "Enter" });
    expect(selectedValue).toBe("preview");
  });

  it("renders different sizes", () => {
    const { rerender } = render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
        size="sm"
      />
    );

    expect(screen.getByLabelText("Present")).toBeInTheDocument();

    rerender(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
        size="lg"
      />
    );

    expect(screen.getByLabelText("Present")).toBeInTheDocument();
  });

  it("shows checkmark for selected option", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
      />
    );

    const dropdownButton = screen.getByLabelText("Open menu");
    fireEvent.click(dropdownButton);

    // The selected option should have aria-selected="true"
    const selectedOption = screen.getByRole("option", { selected: true });
    expect(selectedOption).toHaveTextContent("Present");
  });

  it("applies custom aria-label", () => {
    render(
      <SplitButton
        options={defaultOptions}
        value="present"
        onChange={() => {}}
        aria-label="Play mode"
      />
    );

    expect(screen.getByLabelText("Play mode")).toBeInTheDocument();
  });
});
