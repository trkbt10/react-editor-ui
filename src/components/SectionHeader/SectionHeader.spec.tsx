/**
 * @file SectionHeader tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders title", () => {
    render(<SectionHeader title="Section Title" />);
    expect(screen.getByText("Section Title")).toBeInTheDocument();
  });

  it("renders as non-collapsible by default", () => {
    render(<SectionHeader title="Static" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders as collapsible when specified", () => {
    render(<SectionHeader title="Collapsible" collapsible />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("toggles expanded state when clicked (uncontrolled)", () => {
    render(<SectionHeader title="Toggle" collapsible />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle when toggled", () => {
    const toggleHistory: boolean[] = [];
    const handleToggle = (expanded: boolean) => {
      toggleHistory.push(expanded);
    };
    render(
      <SectionHeader title="Callback" collapsible onToggle={handleToggle} />,
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(toggleHistory).toEqual([false, true]);
  });

  it("respects defaultExpanded prop", () => {
    render(
      <SectionHeader title="Collapsed" collapsible defaultExpanded={false} />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("works as controlled component", () => {
    const { rerender } = render(
      <SectionHeader
        title="Controlled"
        collapsible
        expanded={true}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");

    rerender(
      <SectionHeader
        title="Controlled"
        collapsible
        expanded={false}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("renders action slot", () => {
    render(
      <SectionHeader
        title="With Action"
        action={<button data-testid="action-btn">Add</button>}
      />,
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("action click does not toggle section", () => {
    let toggleCalled = false;
    const handleToggle = () => {
      toggleCalled = true;
    };
    render(
      <SectionHeader
        title="With Action"
        collapsible
        onToggle={handleToggle}
        action={<button data-testid="action-btn">Add</button>}
      />,
    );

    fireEvent.click(screen.getByTestId("action-btn"));
    expect(toggleCalled).toBe(false);
  });

  it("applies custom className", () => {
    const { container } = render(
      <SectionHeader title="Custom" className="custom-header" />,
    );
    expect(container.firstChild).toHaveClass("custom-header");
  });
});
