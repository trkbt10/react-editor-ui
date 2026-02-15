/**
 * @file PropertyGrid component tests
 */

import { render, screen } from "@testing-library/react";
import { PropertyGrid } from "./PropertyGrid";
import { PropertyGridItem } from "./PropertyGridItem";

describe("PropertyGrid", () => {
  it("renders children", () => {
    render(
      <PropertyGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </PropertyGrid>,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies default 2 columns", () => {
    render(
      <PropertyGrid data-testid="grid">
        <div>Item</div>
      </PropertyGrid>,
    );
    const grid = screen.getByTestId("grid");
    expect(grid.style.gridTemplateColumns).toBe("repeat(2, 1fr)");
  });

  it("applies custom columns", () => {
    render(
      <PropertyGrid columns={3} data-testid="grid">
        <div>Item</div>
      </PropertyGrid>,
    );
    const grid = screen.getByTestId("grid");
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("applies custom className", () => {
    render(
      <PropertyGrid className="custom-class" data-testid="grid">
        <div>Item</div>
      </PropertyGrid>,
    );
    expect(screen.getByTestId("grid")).toHaveClass("custom-class");
  });
});

describe("PropertyGridItem", () => {
  it("renders children", () => {
    render(
      <PropertyGridItem>
        <span>Content</span>
      </PropertyGridItem>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies default span 1", () => {
    render(
      <PropertyGridItem data-testid="item">
        <span>Content</span>
      </PropertyGridItem>,
    );
    const item = screen.getByTestId("item");
    expect(item.style.gridColumn).toBe("span 1");
  });

  it("applies custom span", () => {
    render(
      <PropertyGridItem span={2} data-testid="item">
        <span>Content</span>
      </PropertyGridItem>,
    );
    const item = screen.getByTestId("item");
    expect(item.style.gridColumn).toBe("span 2");
  });

  it("applies full span", () => {
    render(
      <PropertyGridItem span="full" data-testid="item">
        <span>Content</span>
      </PropertyGridItem>,
    );
    const item = screen.getByTestId("item");
    expect(item.style.gridColumn).toBe("1 / -1");
  });

  it("applies custom className", () => {
    render(
      <PropertyGridItem className="custom-class" data-testid="item">
        <span>Content</span>
      </PropertyGridItem>,
    );
    expect(screen.getByTestId("item")).toHaveClass("custom-class");
  });
});
