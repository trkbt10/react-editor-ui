/**
 * @file TreeItem tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { TreeItem } from "./TreeItem";

const TestIcon = () => <svg data-testid="tree-icon" />;
const TestBadge = () => <span data-testid="tree-badge">3</span>;

describe("TreeItem", () => {
  it("renders label", () => {
    render(<TreeItem label="Item" />);
    expect(screen.getByText("Item")).toBeInTheDocument();
  });

  it("renders with treeitem role", () => {
    render(<TreeItem label="Item" />);
    expect(screen.getByRole("treeitem")).toBeInTheDocument();
  });

  it("handles click events", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };
    render(<TreeItem label="Clickable" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("treeitem"));
    expect(clicked).toBe(true);
  });

  it("shows selected state", () => {
    render(<TreeItem label="Selected" selected />);

    const item = screen.getByRole("treeitem");
    expect(item).toHaveAttribute("aria-selected", "true");
    expect(item).toHaveStyle({
      backgroundColor: "var(--rei-color-selected, rgba(37, 99, 235, 0.1))",
    });
  });

  it("shows unselected state by default", () => {
    render(<TreeItem label="Unselected" />);

    const item = screen.getByRole("treeitem");
    expect(item).toHaveAttribute("aria-selected", "false");
    // Unselected items don't have the selected background color
    expect(item).not.toHaveStyle({
      backgroundColor: "var(--rei-color-selected, rgba(37, 99, 235, 0.1))",
    });
  });

  it("renders with icon", () => {
    render(<TreeItem label="With Icon" icon={<TestIcon />} />);
    expect(screen.getByTestId("tree-icon")).toBeInTheDocument();
  });

  it("renders with badge", () => {
    render(<TreeItem label="With Badge" badge={<TestBadge />} />);
    expect(screen.getByTestId("tree-badge")).toBeInTheDocument();
  });

  it("shows expander when hasChildren is true", () => {
    render(<TreeItem label="Parent" hasChildren />);
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
  });

  it("does not show expander when hasChildren is false", () => {
    render(<TreeItem label="Leaf" hasChildren={false} />);
    expect(
      screen.queryByRole("button", { name: "Expand" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Collapse" }),
    ).not.toBeInTheDocument();
  });

  it("shows aria-expanded when hasChildren", () => {
    const { rerender } = render(
      <TreeItem label="Parent" hasChildren expanded={false} />,
    );
    expect(screen.getByRole("treeitem")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    rerender(<TreeItem label="Parent" hasChildren expanded={true} />);
    expect(screen.getByRole("treeitem")).toHaveAttribute("aria-expanded", "true");
  });

  it("does not show aria-expanded when no children", () => {
    render(<TreeItem label="Leaf" />);
    expect(screen.getByRole("treeitem")).not.toHaveAttribute("aria-expanded");
  });

  it("calls onToggle when expander is clicked", () => {
    let toggleCalled = false;
    let clickCalled = false;
    const handleToggle = () => {
      toggleCalled = true;
    };
    const handleClick = () => {
      clickCalled = true;
    };
    render(
      <TreeItem
        label="Parent"
        hasChildren
        onToggle={handleToggle}
        onClick={handleClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(toggleCalled).toBe(true);
    expect(clickCalled).toBe(false);
  });

  it("applies depth indentation", () => {
    const { rerender } = render(<TreeItem label="Root" depth={0} />);
    expect(screen.getByRole("treeitem")).toHaveStyle({
      paddingLeft:
        "calc(var(--rei-space-md, 8px) + var(--rei-size-tree-indent, 16px) * 0)",
    });

    rerender(<TreeItem label="Child" depth={2} />);
    expect(screen.getByRole("treeitem")).toHaveStyle({
      paddingLeft:
        "calc(var(--rei-space-md, 8px) + var(--rei-size-tree-indent, 16px) * 2)",
    });
  });

  it("applies custom className", () => {
    render(<TreeItem label="Custom" className="custom-item" />);
    expect(screen.getByRole("treeitem")).toHaveClass("custom-item");
  });
});
