/**
 * @file ControlRow component tests
 */

import { render, screen } from "@testing-library/react";
import { ControlRow } from "./ControlRow";

describe("ControlRow", () => {
  it("renders children with equal flex widths", () => {
    render(
      <ControlRow>
        <input data-testid="input1" />
        <input data-testid="input2" />
      </ControlRow>,
    );

    const input1 = screen.getByTestId("input1");
    const input2 = screen.getByTestId("input2");

    // Each input should be wrapped in a flex container
    const wrapper1 = input1.parentElement;
    const wrapper2 = input2.parentElement;

    expect(wrapper1?.style.flex).toContain("1");
    expect(wrapper1?.style.minWidth).toBe("0");
    expect(wrapper2?.style.flex).toContain("1");
    expect(wrapper2?.style.minWidth).toBe("0");
  });

  it("renders action element at the end", () => {
    render(
      <ControlRow action={<button data-testid="action">Action</button>}>
        <input data-testid="input" />
      </ControlRow>,
    );

    const action = screen.getByTestId("action");
    expect(action).toBeInTheDocument();

    // Action should be a sibling of the input wrapper
    const input = screen.getByTestId("input");
    expect(action.parentElement).toBe(input.parentElement?.parentElement);
  });

  it("renders spacer when spacer prop is true and no action", () => {
    const { container } = render(
      <ControlRow spacer>
        <input data-testid="input" />
      </ControlRow>,
    );

    // Should have 2 children: input wrapper + spacer
    const row = container.firstChild as HTMLElement;
    expect(row.children).toHaveLength(2);

    // Last child should be the spacer
    const spacer = row.lastChild as HTMLElement;
    expect(spacer.style.flexShrink).toBe("0");
  });

  it("does not render spacer when action is provided", () => {
    const { container } = render(
      <ControlRow spacer action={<button>Action</button>}>
        <input data-testid="input" />
      </ControlRow>,
    );

    // Should have 2 children: input wrapper + action (no spacer)
    const row = container.firstChild as HTMLElement;
    expect(row.children).toHaveLength(2);
  });

  it("applies correct gap based on gap prop", () => {
    const { container, rerender } = render(
      <ControlRow gap="sm">
        <input />
      </ControlRow>,
    );

    const rowSm = container.firstChild as HTMLElement;
    expect(rowSm.style.gap).toContain("4"); // SPACE_SM

    rerender(
      <ControlRow gap="md">
        <input />
      </ControlRow>,
    );

    const rowMd = container.firstChild as HTMLElement;
    expect(rowMd.style.gap).toContain("8"); // SPACE_MD
  });

  it("applies actionSize to spacer width", () => {
    const { container, rerender } = render(
      <ControlRow spacer actionSize="sm">
        <input />
      </ControlRow>,
    );

    const rowSm = container.firstChild as HTMLElement;
    const spacerSm = rowSm.lastChild as HTMLElement;
    expect(spacerSm.style.width).toContain("22"); // SIZE_HEIGHT_SM

    rerender(
      <ControlRow spacer actionSize="md">
        <input />
      </ControlRow>,
    );

    const rowMd = container.firstChild as HTMLElement;
    const spacerMd = rowMd.lastChild as HTMLElement;
    expect(spacerMd.style.width).toContain("28"); // SIZE_HEIGHT_MD
  });

  it("applies custom className", () => {
    const { container } = render(
      <ControlRow className="custom-class">
        <input />
      </ControlRow>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders label when provided", () => {
    render(
      <ControlRow label="Scale:">
        <input data-testid="input" />
      </ControlRow>,
    );

    expect(screen.getByText("Scale:")).toBeInTheDocument();
  });

  it("applies default label width", () => {
    render(
      <ControlRow label="Scale:">
        <input />
      </ControlRow>,
    );

    const label = screen.getByText("Scale:");
    expect(label.style.width).toBe("60px");
    expect(label.style.flexShrink).toBe("0");
  });

  it("applies custom label width as number", () => {
    render(
      <ControlRow label="Scale:" labelWidth={80}>
        <input />
      </ControlRow>,
    );

    const label = screen.getByText("Scale:");
    expect(label.style.width).toBe("80px");
  });

  it("applies custom label width as string", () => {
    render(
      <ControlRow label="Scale:" labelWidth="5rem">
        <input />
      </ControlRow>,
    );

    const label = screen.getByText("Scale:");
    expect(label.style.width).toBe("5rem");
  });
});
