/**
 * @file Pagination component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  describe("rendering", () => {
    it("renders all navigation buttons", () => {
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
      );

      expect(screen.getByRole("button", { name: "First" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Last" })).toBeInTheDocument();
    });

    it("shows page info (1-indexed)", () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
      );

      expect(screen.getByText("3 / 5")).toBeInTheDocument();
    });

    it("returns null for single page", () => {
      const { container } = render(
        <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("hides first/last when showFirstLast is false", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={() => {}}
          showFirstLast={false}
        />
      );

      expect(
        screen.queryByRole("button", { name: "First" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Last" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  describe("disabled states", () => {
    it("disables First/Prev on first page", () => {
      render(
        <Pagination currentPage={0} totalPages={5} onPageChange={() => {}} />
      );

      expect(screen.getByRole("button", { name: "First" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Last" })).not.toBeDisabled();
    });

    it("disables Next/Last on last page", () => {
      render(
        <Pagination currentPage={4} totalPages={5} onPageChange={() => {}} />
      );

      expect(screen.getByRole("button", { name: "First" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Prev" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Last" })).toBeDisabled();
    });

    it("disables all buttons when disabled prop is true", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole("button", { name: "First" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Last" })).toBeDisabled();
    });
  });

  describe("callbacks", () => {
    it("calls onPageChange with 0 when First is clicked", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "First" }));

      expect(handlePageChange).toHaveBeenCalledWith(0);
    });

    it("calls onPageChange with currentPage - 1 when Prev is clicked", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Prev" }));

      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange with currentPage + 1 when Next is clicked", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(handlePageChange).toHaveBeenCalledWith(4);
    });

    it("calls onPageChange with totalPages - 1 when Last is clicked", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Last" }));

      expect(handlePageChange).toHaveBeenCalledWith(4);
    });

    it("does not call onPageChange when Prev is clicked on first page", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={0}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Prev" }));

      expect(handlePageChange).not.toHaveBeenCalled();
    });

    it("does not call onPageChange when Next is clicked on last page", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={4}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(handlePageChange).not.toHaveBeenCalled();
    });
  });

  describe("size variants", () => {
    it("renders with sm size by default", () => {
      render(
        <Pagination currentPage={0} totalPages={5} onPageChange={() => {}} />
      );

      // Just verify it renders without errors
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });

    it("renders with md size", () => {
      render(
        <Pagination
          currentPage={0}
          totalPages={5}
          onPageChange={() => {}}
          size="md"
        />
      );

      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <Pagination
          currentPage={0}
          totalPages={5}
          onPageChange={() => {}}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
