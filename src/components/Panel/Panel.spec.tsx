/**
 * @file Panel component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Panel } from "./Panel";

function createTracker() {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  return { fn, calls };
}

describe("Panel", () => {
  it("renders with title", () => {
    render(<Panel title="Test Panel">Content</Panel>);

    expect(screen.getByText("Test Panel")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const { fn: handleClose } = createTracker();
    render(
      <Panel title="Test" onClose={handleClose}>
        Content
      </Panel>,
    );

    const closeButton = screen.getByLabelText("Close");
    expect(closeButton).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<Panel title="Test">Content</Panel>);

    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const { fn: handleClose, calls } = createTracker();
    render(
      <Panel title="Test" onClose={handleClose}>
        Content
      </Panel>,
    );

    fireEvent.click(screen.getByLabelText("Close"));
    expect(calls.length).toBe(1);
  });

  it("applies custom width", () => {
    const { container } = render(
      <Panel title="Test" width={400}>
        Content
      </Panel>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("400px");
  });

  it("applies string width", () => {
    const { container } = render(
      <Panel title="Test" width="100%">
        Content
      </Panel>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("100%");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Panel title="Test" className="custom-class">
        Content
      </Panel>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toBe("custom-class");
  });
});
