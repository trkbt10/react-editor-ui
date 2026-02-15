/**
 * @file PropertySection component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { PropertySection } from "./PropertySection";

describe("PropertySection", () => {
  it("renders title", () => {
    render(
      <PropertySection title="Test Section">
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <PropertySection title="Test Section">
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("hides content when collapsed", () => {
    render(
      <PropertySection title="Test Section" collapsible defaultExpanded={false}>
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("shows content when expanded", () => {
    render(
      <PropertySection title="Test Section" collapsible defaultExpanded>
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("toggles content on header click", () => {
    render(
      <PropertySection title="Test Section" collapsible defaultExpanded>
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Test Section"));
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Test Section"));
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("calls onToggle when toggled", () => {
    let toggledValue: boolean | null = null;
    const handleToggle = (expanded: boolean) => {
      toggledValue = expanded;
    };
    render(
      <PropertySection
        title="Test Section"
        collapsible
        defaultExpanded
        onToggle={handleToggle}
      >
        <div>Content</div>
      </PropertySection>,
    );
    fireEvent.click(screen.getByText("Test Section"));
    expect(toggledValue).toBe(false);
  });

  it("respects controlled expanded prop", () => {
    const { rerender } = render(
      <PropertySection title="Test Section" collapsible expanded>
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();

    rerender(
      <PropertySection title="Test Section" collapsible expanded={false}>
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders action", () => {
    render(
      <PropertySection title="Test Section" action={<button>Add</button>}>
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PropertySection title="Test Section" className="custom-class">
        <div>Content</div>
      </PropertySection>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows content in non-collapsible mode", () => {
    render(
      <PropertySection title="Test Section">
        <div>Content</div>
      </PropertySection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
