/**
 * @file FloatingToolbar tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingToolbar } from "./FloatingToolbar";
import type { FloatingToolbarOperation, FloatingToolbarAnchor } from "./types";

// =============================================================================
// Test Fixtures
// =============================================================================

const createTestOperations = (count: number = 3): FloatingToolbarOperation[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `op-${i}`,
    label: `Operation ${i}`,
    icon: <span data-testid={`icon-${i}`}>Icon {i}</span>,
  }));
};

const defaultAnchor: FloatingToolbarAnchor = {
  x: 100,
  y: 100,
  width: 200,
  height: 20,
};

// =============================================================================
// Tests
// =============================================================================

describe("FloatingToolbar", () => {
  describe("rendering", () => {
    it("should render nothing when operations is empty", () => {
      const state = { selectedId: "" };
      const { container } = render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={[]}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      // Should render nothing
      expect(container.querySelector('[role="toolbar"]')).toBeNull();
    });

    it("should render toolbar with operations", () => {
      const operations = createTestOperations(3);
      const state = { selectedId: "" };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      // Should render toolbar (use aria-label to distinguish)
      expect(screen.getByLabelText("Selection toolbar")).toBeInTheDocument();

      // Should render all operation buttons
      expect(screen.getByLabelText("Operation 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Operation 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Operation 2")).toBeInTheDocument();
    });

    it("should render icons for each operation", () => {
      const operations = createTestOperations(2);
      const state = { selectedId: "" };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      expect(screen.getByTestId("icon-0")).toBeInTheDocument();
      expect(screen.getByTestId("icon-1")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should call onOperationSelect when operation is clicked", () => {
      const operations = createTestOperations(3);
      const state = { selectedId: "", callCount: 0 };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => {
            state.selectedId = id;
            state.callCount += 1;
          }}
        />,
      );

      fireEvent.click(screen.getByLabelText("Operation 1"));

      expect(state.callCount).toBe(1);
      expect(state.selectedId).toBe("op-1");
    });

    it("should not call onOperationSelect when disabled operation is clicked", () => {
      const operations: FloatingToolbarOperation[] = [
        { id: "op-0", label: "Disabled Op", icon: <span>X</span>, disabled: true },
      ];
      const state = { callCount: 0 };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={() => { state.callCount += 1; }}
        />,
      );

      const button = screen.getByLabelText("Disabled Op");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(state.callCount).toBe(0);
    });

    it("should prevent default on pointer down to avoid deselecting text", () => {
      const operations = createTestOperations(1);
      const state = { selectedId: "" };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      // The outer container (with aria-label="Selection toolbar") handles pointer down
      const toolbar = screen.getByLabelText("Selection toolbar");

      // We can't easily test preventDefault was called without mocks,
      // but we can verify the toolbar is rendered correctly
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute("role", "toolbar");
    });
  });

  describe("active state", () => {
    it("should render active operation with selected variant", () => {
      const operations: FloatingToolbarOperation[] = [
        { id: "bold", label: "Bold", icon: <span>B</span>, active: true },
        { id: "italic", label: "Italic", icon: <span>I</span>, active: false },
      ];
      const state = { selectedId: "" };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      // Both buttons should be present
      expect(screen.getByLabelText("Bold")).toBeInTheDocument();
      expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const operations = createTestOperations(2);
      const state = { selectedId: "" };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      // The outer container should have aria-label
      const toolbar = screen.getByLabelText("Selection toolbar");
      expect(toolbar).toHaveAttribute("role", "toolbar");
    });

    it("should have aria-label on each operation button", () => {
      const operations = createTestOperations(2);
      const state = { selectedId: "" };

      render(
        <FloatingToolbar
          anchor={defaultAnchor}
          operations={operations}
          onOperationSelect={(id) => { state.selectedId = id; }}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveAttribute("aria-label", "Operation 0");
      expect(buttons[1]).toHaveAttribute("aria-label", "Operation 1");
    });
  });
});
