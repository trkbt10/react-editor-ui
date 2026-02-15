/**
 * @file PropertyRow tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyRow } from "./PropertyRow";

describe("PropertyRow", () => {
  it("renders label and value", () => {
    render(<PropertyRow label="Name">John Doe</PropertyRow>);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders with ReactNode children", () => {
    render(
      <PropertyRow label="Status">
        <span data-testid="status-badge">Active</span>
      </PropertyRow>,
    );

    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });

  it("handles click events when onClick is provided", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };
    render(
      <PropertyRow label="Editable" onClick={handleClick}>
        Click me
      </PropertyRow>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("does not have button role when onClick is not provided", () => {
    render(<PropertyRow label="Static">Value</PropertyRow>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("has button role when onClick is provided", () => {
    render(
      <PropertyRow label="Clickable" onClick={() => {}}>
        Value
      </PropertyRow>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PropertyRow label="Label" className="custom-row">
        Value
      </PropertyRow>,
    );
    expect(container.firstChild).toHaveClass("custom-row");
  });

  it("applies hover cursor when clickable", () => {
    const { container } = render(
      <PropertyRow label="Clickable" onClick={() => {}}>
        Value
      </PropertyRow>,
    );
    expect(container.firstChild).toHaveStyle({ cursor: "pointer" });
  });

  it("applies default cursor when not clickable", () => {
    const { container } = render(
      <PropertyRow label="Static">Value</PropertyRow>,
    );
    expect(container.firstChild).toHaveStyle({ cursor: "default" });
  });
});
