/**
 * @file ControlGroup component tests
 */

import { render, screen } from "@testing-library/react";
import { ControlGroup } from "./ControlGroup";

describe("ControlGroup", () => {
  it("renders label when provided", () => {
    render(
      <ControlGroup label="Position">
        <input data-testid="input" />
      </ControlGroup>,
    );

    expect(screen.getByText("Position")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(
      <ControlGroup>
        <input data-testid="input" />
      </ControlGroup>,
    );

    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("applies flex column layout", () => {
    const { container } = render(
      <ControlGroup label="Test">
        <input />
      </ControlGroup>,
    );

    const group = container.firstChild as HTMLElement;
    expect(group.style.display).toBe("flex");
    expect(group.style.flexDirection).toBe("column");
  });

  it("applies correct gap based on gap prop", () => {
    const { container, rerender } = render(
      <ControlGroup label="Test" gap="sm">
        <input />
      </ControlGroup>,
    );

    const groupSm = container.firstChild as HTMLElement;
    expect(groupSm.style.gap).toContain("4"); // SPACE_SM

    rerender(
      <ControlGroup label="Test" gap="md">
        <input />
      </ControlGroup>,
    );

    const groupMd = container.firstChild as HTMLElement;
    expect(groupMd.style.gap).toContain("8"); // SPACE_MD
  });

  it("applies custom className", () => {
    const { container } = render(
      <ControlGroup className="custom-class">
        <input />
      </ControlGroup>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies muted text color to label", () => {
    render(
      <ControlGroup label="Position">
        <input />
      </ControlGroup>,
    );

    const label = screen.getByText("Position");
    expect(label.style.color).toContain("--rei-color-text-muted");
  });
});
