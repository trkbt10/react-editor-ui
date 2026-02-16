/**
 * @file TransformButtons component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import {
  TransformButtons,
  type TransformActionGroup,
} from "./TransformButtons";

function MockIcon({ label }: { label: string }) {
  return <span data-testid={`icon-${label}`}>Icon</span>;
}

function createCallTracker() {
  const calls: string[] = [];
  return {
    calls,
    handler: (actionId: string) => {
      calls.push(actionId);
    },
  };
}

const rotateGroup: TransformActionGroup = {
  id: "rotate",
  actions: [
    { id: "rotate-cw", icon: <MockIcon label="rotate-cw" />, label: "Rotate 90° right" },
    { id: "rotate-ccw", icon: <MockIcon label="rotate-ccw" />, label: "Rotate 90° left" },
  ],
};

const flipGroup: TransformActionGroup = {
  id: "flip",
  actions: [
    { id: "flip-h", icon: <MockIcon label="flip-h" />, label: "Flip horizontal" },
    { id: "flip-v", icon: <MockIcon label="flip-v" />, label: "Flip vertical" },
  ],
};

const alignGroup: TransformActionGroup = {
  id: "align",
  actions: [
    { id: "align-left", icon: <MockIcon label="align-left" />, label: "Align left" },
    { id: "align-center", icon: <MockIcon label="align-center" />, label: "Align center" },
    { id: "align-right", icon: <MockIcon label="align-right" />, label: "Align right" },
  ],
};

describe("TransformButtons", () => {
  it("renders action buttons from groups", () => {
    const { handler } = createCallTracker();

    render(
      <TransformButtons groups={[rotateGroup, flipGroup]} onAction={handler} />,
    );

    expect(screen.getByLabelText("Rotate 90° right")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate 90° left")).toBeInTheDocument();
    expect(screen.getByLabelText("Flip horizontal")).toBeInTheDocument();
    expect(screen.getByLabelText("Flip vertical")).toBeInTheDocument();
  });

  it("calls onAction with correct action id when button clicked", () => {
    const { calls, handler } = createCallTracker();

    render(
      <TransformButtons groups={[rotateGroup, flipGroup]} onAction={handler} />,
    );

    fireEvent.click(screen.getByLabelText("Rotate 90° right"));
    expect(calls).toContain("rotate-cw");

    fireEvent.click(screen.getByLabelText("Flip horizontal"));
    expect(calls).toContain("flip-h");
  });

  it("renders dividers between groups", () => {
    const { handler } = createCallTracker();

    render(
      <TransformButtons groups={[rotateGroup, flipGroup]} onAction={handler} />,
    );

    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(1);
  });

  it("renders multiple dividers for multiple groups", () => {
    const { handler } = createCallTracker();

    render(
      <TransformButtons
        groups={[rotateGroup, flipGroup, alignGroup]}
        onAction={handler}
      />,
    );

    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(2);
  });

  it("does not render divider for single group", () => {
    const { handler } = createCallTracker();

    render(<TransformButtons groups={[rotateGroup]} onAction={handler} />);

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("disables all buttons when disabled prop is true", () => {
    const { handler } = createCallTracker();

    render(
      <TransformButtons
        groups={[rotateGroup]}
        onAction={handler}
        disabled
      />,
    );

    expect(screen.getByLabelText("Rotate 90° right")).toBeDisabled();
    expect(screen.getByLabelText("Rotate 90° left")).toBeDisabled();
  });

  it("does not call onAction when button is disabled", () => {
    const { calls, handler } = createCallTracker();

    render(
      <TransformButtons groups={[rotateGroup]} onAction={handler} disabled />,
    );

    fireEvent.click(screen.getByLabelText("Rotate 90° right"));
    expect(calls).toHaveLength(0);
  });

  it("disables individual action when action.disabled is true", () => {
    const { handler } = createCallTracker();
    const groupWithDisabled: TransformActionGroup = {
      id: "mixed",
      actions: [
        { id: "enabled", icon: <MockIcon label="enabled" />, label: "Enabled" },
        { id: "disabled", icon: <MockIcon label="disabled" />, label: "Disabled", disabled: true },
      ],
    };

    render(
      <TransformButtons groups={[groupWithDisabled]} onAction={handler} />,
    );

    expect(screen.getByLabelText("Enabled")).not.toBeDisabled();
    expect(screen.getByLabelText("Disabled")).toBeDisabled();
  });

  it("skips empty groups", () => {
    const { handler } = createCallTracker();
    const emptyGroup: TransformActionGroup = { id: "empty", actions: [] };

    render(
      <TransformButtons
        groups={[rotateGroup, emptyGroup, flipGroup]}
        onAction={handler}
      />,
    );

    // Should only have 1 divider (between rotate and flip, not counting empty)
    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(1);
  });

  it("renders tooltips for buttons", () => {
    const { handler } = createCallTracker();

    render(<TransformButtons groups={[rotateGroup]} onAction={handler} />);

    const tooltips = screen.getAllByRole("tooltip", { hidden: true });
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { handler } = createCallTracker();

    const { container } = render(
      <TransformButtons
        groups={[rotateGroup]}
        onAction={handler}
        className="custom-transform"
      />,
    );

    expect(container.querySelector(".custom-transform")).toBeInTheDocument();
  });

  it("applies different size variants", () => {
    const { handler } = createCallTracker();

    const { rerender } = render(
      <TransformButtons groups={[rotateGroup]} onAction={handler} size="sm" />,
    );

    expect(screen.getByLabelText("Rotate 90° right")).toBeInTheDocument();

    rerender(
      <TransformButtons groups={[rotateGroup]} onAction={handler} size="lg" />,
    );

    expect(screen.getByLabelText("Rotate 90° right")).toBeInTheDocument();
  });

  it("renders nothing when groups array is empty", () => {
    const { handler } = createCallTracker();

    const { container } = render(
      <TransformButtons groups={[]} onAction={handler} />,
    );

    expect(container.querySelector("button")).not.toBeInTheDocument();
  });

  it("supports custom action ids", () => {
    const { calls, handler } = createCallTracker();
    const customGroup: TransformActionGroup = {
      id: "custom",
      actions: [
        { id: "my-custom-action", icon: <MockIcon label="custom" />, label: "Custom Action" },
      ],
    };

    render(<TransformButtons groups={[customGroup]} onAction={handler} />);

    fireEvent.click(screen.getByLabelText("Custom Action"));
    expect(calls).toContain("my-custom-action");
  });
});
