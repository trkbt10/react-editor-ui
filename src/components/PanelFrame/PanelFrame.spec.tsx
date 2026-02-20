/**
 * @file PanelFrame component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { PanelFrame } from "./PanelFrame";

function createTracker() {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  return { fn, calls };
}

describe("PanelFrame", () => {
  it("renders with title", () => {
    render(<PanelFrame title="Test Panel">Content</PanelFrame>);

    expect(screen.getByText("Test Panel")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const { fn: handleClose } = createTracker();
    render(
      <PanelFrame title="Test" onClose={handleClose}>
        Content
      </PanelFrame>,
    );

    const closeButton = screen.getByLabelText("Close");
    expect(closeButton).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<PanelFrame title="Test">Content</PanelFrame>);

    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const { fn: handleClose, calls } = createTracker();
    render(
      <PanelFrame title="Test" onClose={handleClose}>
        Content
      </PanelFrame>,
    );

    fireEvent.click(screen.getByLabelText("Close"));
    expect(calls.length).toBe(1);
  });

  it("applies custom width", () => {
    const { container } = render(
      <PanelFrame title="Test" width={400}>
        Content
      </PanelFrame>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("400px");
  });

  it("applies string width", () => {
    const { container } = render(
      <PanelFrame title="Test" width="100%">
        Content
      </PanelFrame>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("100%");
  });

  it("applies custom className", () => {
    const { container } = render(
      <PanelFrame title="Test" className="custom-class">
        Content
      </PanelFrame>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toBe("custom-class");
  });

  it("has box-sizing: border-box to include border in width", () => {
    const { container } = render(
      <PanelFrame title="Test" width={320}>
        Content
      </PanelFrame>,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.style.boxSizing).toBe("border-box");
  });

  it("content area has overflow: hidden to prevent child overflow", () => {
    const { container } = render(
      <PanelFrame title="Test">
        Content
      </PanelFrame>,
    );

    const panel = container.firstChild as HTMLElement;
    // Content is the second child (after header)
    const content = panel.children[1] as HTMLElement;
    expect(content.style.overflow).toBe("hidden");
  });
});
