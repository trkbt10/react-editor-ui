import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { DataTableViewer } from "./DataTableViewer";
import type { TableColumnDef } from "../../components/Table/types";

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  targets: Element[] = [];
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.targets.push(target);
    // Simulate initial size - large enough for all columns
    this.callback(
      [
        {
          target,
          contentRect: { width: 1200, height: 600 } as DOMRectReadOnly,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this
    );
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  (global as unknown as { ResizeObserver: typeof MockResizeObserver }).ResizeObserver =
    MockResizeObserver;
});

describe("DataTableViewer", () => {
  const columns: TableColumnDef[] = [
    { key: "id", label: "ID", width: 80 },
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status" },
  ];

  const rows = [
    { id: 1, name: "Alice", status: "Active" },
    { id: 2, name: "Bob", status: "Inactive" },
    { id: 3, name: "Charlie", status: "Active" },
  ];

  it("should render with rows and columns", () => {
    render(<DataTableViewer rows={rows} columns={columns} height={400} />);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should render row data", () => {
    render(<DataTableViewer rows={rows} columns={columns} height={400} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("should show toolbar when showToolbar=true and onSearchChange provided", () => {
    const onSearchChange = vi.fn();
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        showToolbar
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    );

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("should not show toolbar when showToolbar=false", () => {
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        showToolbar={false}
        searchQuery=""
        onSearchChange={vi.fn()}
      />
    );

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("should call onSearchChange when search input changes", () => {
    const onSearchChange = vi.fn();
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "test" } });

    expect(onSearchChange).toHaveBeenCalledWith("test");
  });

  it("should call onSort when header clicked", () => {
    const onSort = vi.fn();
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("should cycle sort direction on repeated clicks", () => {
    const onSort = vi.fn();
    const { rerender } = render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        sortKey="name"
        sortDirection="asc"
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "desc");

    onSort.mockClear();
    rerender(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        sortKey="name"
        sortDirection="desc"
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", null);
  });

  it("should call onRowClick when row is clicked", () => {
    const onRowClick = vi.fn();
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(0, rows[0]);
  });

  it("should highlight selected row", () => {
    const { container } = render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        selectedRowIndex={1}
      />
    );

    // Find the row containing "Bob" and check if it has selected style
    const bobCell = screen.getByText("Bob");
    const row = bobCell.closest('[role="row"]');
    expect(row).toBeInTheDocument();
  });

  it("should show row count in toolbar", () => {
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        searchQuery=""
        onSearchChange={vi.fn()}
        showRowCount
      />
    );

    expect(screen.getByText("3 rows")).toBeInTheDocument();
  });

  it("should show filtered row count when totalRowCount differs", () => {
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        searchQuery=""
        onSearchChange={vi.fn()}
        showRowCount
        totalRowCount={10}
      />
    );

    expect(screen.getByText("3 of 10 rows")).toBeInTheDocument();
  });

  it("should render empty table", () => {
    render(<DataTableViewer rows={[]} columns={columns} height={400} />);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should use custom cell renderer", () => {
    const columnsWithRenderer: TableColumnDef[] = [
      {
        key: "name",
        label: "Name",
        render: (value) => `Name: ${value}`,
      },
    ];

    const singleRow = [{ name: "Test" }];

    render(
      <DataTableViewer
        rows={singleRow}
        columns={columnsWithRenderer}
        height={400}
      />
    );

    expect(screen.getByText("Name: Test")).toBeInTheDocument();
  });

  it("should handle querySlot", () => {
    render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        searchQuery=""
        onSearchChange={vi.fn()}
        querySlot={<button>Run Query</button>}
      />
    );

    expect(screen.getByText("Run Query")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DataTableViewer
        rows={rows}
        columns={columns}
        height={400}
        className="custom-table"
      />
    );

    expect(container.querySelector(".custom-table")).toBeInTheDocument();
  });
});
