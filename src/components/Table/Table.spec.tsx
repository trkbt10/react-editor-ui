/**
 * @file Table component tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import {
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "./Table";
import type { TableColumnDef } from "./types";

describe("TableHeaderCell", () => {
  const baseColumn: TableColumnDef = {
    key: "name",
    label: "Name",
  };

  it("should render column label", () => {
    render(
      <TableHeaderCell
        column={baseColumn}
        isSorted={false}
        sortDirection={null}
        isDragging={false}
        isDragOver={false}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should show sort icon when sortable", () => {
    const sortableColumn: TableColumnDef = { ...baseColumn, sortable: true };
    const { container } = render(
      <TableHeaderCell
        column={sortableColumn}
        isSorted={false}
        sortDirection={null}
        isDragging={false}
        isDragOver={false}
      />
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should call onSort when clicked and sortable", () => {
    const onSort = vi.fn();
    const sortableColumn: TableColumnDef = { ...baseColumn, sortable: true };
    render(
      <TableHeaderCell
        column={sortableColumn}
        isSorted={false}
        sortDirection={null}
        isDragging={false}
        isDragOver={false}
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalled();
  });

  it("should not call onSort when sortable but onSort not provided", () => {
    const sortableColumn: TableColumnDef = { ...baseColumn, sortable: true };
    render(
      <TableHeaderCell
        column={sortableColumn}
        isSorted={false}
        sortDirection={null}
        isDragging={false}
        isDragOver={false}
      />
    );

    // Should not throw
    fireEvent.click(screen.getByText("Name"));
  });

  it("should have aria-sort when sorted ascending", () => {
    const sortableColumn: TableColumnDef = { ...baseColumn, sortable: true };
    render(
      <TableHeaderCell
        column={sortableColumn}
        isSorted={true}
        sortDirection="asc"
        isDragging={false}
        isDragOver={false}
      />
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
  });

  it("should have aria-sort when sorted descending", () => {
    const sortableColumn: TableColumnDef = { ...baseColumn, sortable: true };
    render(
      <TableHeaderCell
        column={sortableColumn}
        isSorted={true}
        sortDirection="desc"
        isDragging={false}
        isDragOver={false}
      />
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "descending"
    );
  });

  it("should apply opacity when dragging", () => {
    const draggableColumn: TableColumnDef = { ...baseColumn, draggable: true };
    const { container } = render(
      <TableHeaderCell
        column={draggableColumn}
        isSorted={false}
        sortDirection={null}
        isDragging={true}
        isDragOver={false}
      />
    );

    const cell = container.firstChild as HTMLElement;
    expect(cell.style.opacity).toBe("0.5");
  });
});

describe("TableHeader", () => {
  const columns: TableColumnDef[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "age", label: "Age", sortable: true, align: "right" },
    { key: "city", label: "City" },
  ];

  it("should render all column headers", () => {
    render(<TableHeader columns={columns} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
  });

  it("should call onSort with column key", () => {
    const onSort = vi.fn();
    render(<TableHeader columns={columns} onSort={onSort} />);

    fireEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("should highlight sorted column", () => {
    render(
      <TableHeader
        columns={columns}
        sortKey="name"
        sortDirection="asc"
      />
    );

    const nameHeader = screen.getByText("Name").closest('[role="columnheader"]');
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("should apply sticky style by default", () => {
    const { container } = render(<TableHeader columns={columns} />);

    const header = container.firstChild as HTMLElement;
    expect(header.style.position).toBe("sticky");
  });

  it("should not apply sticky style when sticky=false", () => {
    const { container } = render(
      <TableHeader columns={columns} sticky={false} />
    );

    const header = container.firstChild as HTMLElement;
    expect(header.style.position).not.toBe("sticky");
  });
});

describe("TableRow", () => {
  it("should render children", () => {
    render(
      <TableRow rowIndex={0}>
        <span>Cell content</span>
      </TableRow>
    );

    expect(screen.getByText("Cell content")).toBeInTheDocument();
  });

  it("should call onClick with rowIndex", () => {
    const onClick = vi.fn();
    render(
      <TableRow rowIndex={5} onClick={onClick}>
        <span>Cell</span>
      </TableRow>
    );

    fireEvent.click(screen.getByRole("row"));
    expect(onClick).toHaveBeenCalledWith(5);
  });

  it("should apply selected background", () => {
    const { container } = render(
      <TableRow rowIndex={0} selected>
        <span>Cell</span>
      </TableRow>
    );

    const row = container.firstChild as HTMLElement;
    expect(row.style.backgroundColor).toBeTruthy();
  });

  it("should have data-index attribute", () => {
    render(
      <TableRow rowIndex={3}>
        <span>Cell</span>
      </TableRow>
    );

    expect(screen.getByRole("row")).toHaveAttribute("data-index", "3");
  });
});

describe("TableCell", () => {
  it("should render children", () => {
    render(<TableCell>Cell content</TableCell>);

    expect(screen.getByText("Cell content")).toBeInTheDocument();
  });

  it("should apply left alignment by default", () => {
    const { container } = render(<TableCell>Cell</TableCell>);

    const cell = container.firstChild as HTMLElement;
    expect(cell.style.justifyContent).toBe("flex-start");
  });

  it("should apply center alignment", () => {
    const { container } = render(<TableCell align="center">Cell</TableCell>);

    const cell = container.firstChild as HTMLElement;
    expect(cell.style.justifyContent).toBe("center");
  });

  it("should apply right alignment", () => {
    const { container } = render(<TableCell align="right">Cell</TableCell>);

    const cell = container.firstChild as HTMLElement;
    expect(cell.style.justifyContent).toBe("flex-end");
  });

  it("should apply custom width", () => {
    const { container } = render(<TableCell width={200}>Cell</TableCell>);

    const cell = container.firstChild as HTMLElement;
    expect(cell.style.width).toBe("200px");
  });
});

describe("TableBody", () => {
  it("should render children", () => {
    render(
      <TableBody>
        <div>Row 1</div>
        <div>Row 2</div>
      </TableBody>
    );

    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();
  });

  it("should have rowgroup role", () => {
    render(
      <TableBody>
        <div>Row</div>
      </TableBody>
    );

    expect(screen.getByRole("rowgroup")).toBeInTheDocument();
  });
});
