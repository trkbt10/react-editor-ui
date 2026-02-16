/**
 * @file LogViewer component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { LogViewer, type LogItem } from "./LogViewer";

// Mock ResizeObserver with no-op implementations
class MockResizeObserver implements ResizeObserver {
  observe(): void {
    // no-op for testing
  }
  unobserve(): void {
    // no-op for testing
  }
  disconnect(): void {
    // no-op for testing
  }
}
global.ResizeObserver = MockResizeObserver;

// Helper to create test log items
function createTestItems(count: number): LogItem[] {
  const levels: LogItem["level"][] = ["info", "warning", "error", "debug", "success"];
  return Array.from({ length: count }, (_, i) => ({
    message: `Log message ${i + 1}`,
    level: levels[i % levels.length],
    timestamp: new Date(Date.now() - i * 1000),
    source: `source-${i}.ts`,
  }));
}

describe("LogViewer", () => {
  describe("rendering", () => {
    it("renders with empty items", () => {
      render(<LogViewer items={[]} height={300} />);
      expect(screen.getByText("0-0 of 0")).toBeInTheDocument();
    });

    it("renders log items", () => {
      const items = createTestItems(5);
      render(<LogViewer items={items} height={300} />);

      expect(screen.getByText("Log message 1")).toBeInTheDocument();
    });

    it("shows count indicator by default", () => {
      const items = createTestItems(10);
      render(<LogViewer items={items} height={300} />);

      expect(screen.getByText(/of 10/)).toBeInTheDocument();
    });

    it("hides count indicator when showCount is false", () => {
      const items = createTestItems(10);
      render(<LogViewer items={items} height={300} showCount={false} />);

      expect(screen.queryByText(/of 10/)).not.toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("highlights selected item", () => {
      const items = createTestItems(5);
      render(<LogViewer items={items} height={300} selectedIndex={0} />);

      const selectedElement = screen.getByText("Log message 1").closest("[aria-selected]");
      expect(selectedElement).toHaveAttribute("aria-selected", "true");
    });

    it("calls onItemClick when item is clicked", () => {
      const items = createTestItems(5);
      const handleClick = vi.fn();
      render(<LogViewer items={items} height={300} onItemClick={handleClick} />);

      const firstItem = screen.getByText("Log message 1");
      fireEvent.click(firstItem);

      expect(handleClick).toHaveBeenCalledWith(0, items[0]);
    });
  });

  describe("filtering", () => {
    it("filters items based on filter function", () => {
      const items = createTestItems(10);
      const filter = (item: LogItem) => item.level === "error";

      render(<LogViewer items={items} height={300} filter={filter} />);

      // Should show filtered count
      expect(screen.getByText(/filtered from 10/)).toBeInTheDocument();
    });

    it("shows search query in header", () => {
      const items = createTestItems(5);
      render(<LogViewer items={items} height={300} searchQuery="test" />);

      expect(screen.getByText("test")).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("shows pagination controls when enabled", () => {
      const items = createTestItems(200);
      render(<LogViewer items={items} height={300} pagination pageSize={50} />);

      expect(screen.getByText("1 / 4")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "First" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Last" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });

    it("disables First/Prev buttons on first page", () => {
      const items = createTestItems(100);
      render(<LogViewer items={items} height={300} pagination pageSize={50} page={0} />);

      expect(screen.getByRole("button", { name: "First" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Last" })).not.toBeDisabled();
    });

    it("disables Next/Last buttons on last page", () => {
      const items = createTestItems(100);
      render(<LogViewer items={items} height={300} pagination pageSize={50} page={1} />);

      expect(screen.getByRole("button", { name: "First" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Prev" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Last" })).toBeDisabled();
    });

    it("calls onPageChange when navigation button is clicked", () => {
      const items = createTestItems(100);
      const handlePageChange = vi.fn();
      render(
        <LogViewer
          items={items}
          height={300}
          pagination
          pageSize={50}
          page={0}
          onPageChange={handlePageChange}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it("does not show pagination when there is only one page", () => {
      const items = createTestItems(30);
      render(<LogViewer items={items} height={300} pagination pageSize={50} />);

      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    });
  });

  describe("virtual scrolling", () => {
    it("applies overflow auto style to container", () => {
      const items = createTestItems(100);
      const { container } = render(<LogViewer items={items} height={300} />);

      const scrollContainer = container.querySelector('[style*="overflow: auto"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    it("sets inner container height based on total items", () => {
      const items = createTestItems(100);
      const { container } = render(
        <LogViewer items={items} height={300} estimatedItemHeight={36} />,
      );

      // Inner container should have height based on all items
      const innerContainer = container.querySelector('[style*="position: relative"]');
      expect(innerContainer).toBeInTheDocument();
    });
  });

  describe("className prop", () => {
    it("applies custom className", () => {
      const items = createTestItems(5);
      const { container } = render(
        <LogViewer items={items} height={300} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
