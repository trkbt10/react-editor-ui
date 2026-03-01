/**
 * @file Table component demo page
 */

import { useState, useMemo, useCallback, useRef } from "react";
import type { DragEvent } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import {
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/Table/Table";
import type { TableColumnDef, SortDirection } from "../../../components/Table/Table";

// ============================================================================
// Sample data
// ============================================================================

type Person = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

const sampleData: Person[] = [
  { id: 1, name: "Alice Smith", email: "alice@example.com", role: "Engineer", status: "active" },
  { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "Designer", status: "active" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Manager", status: "inactive" },
  { id: 4, name: "Diana Miller", email: "diana@example.com", role: "Engineer", status: "active" },
  { id: 5, name: "Edward Davis", email: "edward@example.com", role: "Analyst", status: "inactive" },
];

const columns: TableColumnDef<Person>[] = [
  { key: "id", label: "ID", width: 60, sortable: true, align: "right" },
  { key: "name", label: "Name", sortable: true, draggable: true },
  { key: "email", label: "Email", sortable: true, draggable: true },
  { key: "role", label: "Role", sortable: true, draggable: true },
  {
    key: "status",
    label: "Status",
    width: 80,
    sortable: true,
    render: (value) => {
      const status = value as Person["status"];
      return (
        <span style={{ color: status === "active" ? "#22c55e" : "#ef4444" }}>
          {status}
        </span>
      );
    },
  },
];

// ============================================================================
// Demo component
// ============================================================================

export function TableDemo() {
  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Selection
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Drag state
  const [draggingColKey, setDraggingColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);

  // Column order
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((c) => c.key));

  // Resizable columns state
  const [resizableColumnWidths, setResizableColumnWidths] = useState<number[]>([
    60, 150, 200, 100, 80,
  ]);

  // Ordered columns
  const orderedColumns = useMemo(() => {
    return columnOrder
      .map((key) => columns.find((c) => c.key === key))
      .filter((c): c is TableColumnDef<Person> => c !== undefined);
  }, [columnOrder]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return sampleData;

    return [...sampleData].sort((a, b) => {
      const aVal = a[sortKey as keyof Person];
      const bVal = b[sortKey as keyof Person];

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [sortKey, sortDirection]);

  // Sort handler - use ref to avoid recreating callback when sort state changes
  const sortStateRef = useRef({ key: sortKey, direction: sortDirection });
  sortStateRef.current = { key: sortKey, direction: sortDirection };

  const handleSort = useCallback((key: string) => {
    const { key: currentKey, direction: currentDir } = sortStateRef.current;
    if (currentKey === key) {
      const next: SortDirection =
        currentDir === "asc" ? "desc" : currentDir === "desc" ? null : "asc";
      setSortKey(next ? key : null);
      setSortDirection(next);
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }, []);

  // Drag handlers
  const handleColumnDragStart = useCallback((key: string, e: DragEvent<HTMLElement>) => {
    setDraggingColKey(key);
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleColumnDragOver = useCallback((key: string) => {
    setDragOverColKey(key);
  }, []);

  const handleColumnDrop = useCallback((key: string, e: DragEvent<HTMLElement>) => {
    const sourceKey = e.dataTransfer.getData("text/plain");
    if (sourceKey && sourceKey !== key) {
      setColumnOrder((prev) => {
        const sourceIndex = prev.indexOf(sourceKey);
        const targetIndex = prev.indexOf(key);
        if (sourceIndex === -1 || targetIndex === -1) return prev;
        const newOrder = [...prev];
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceKey);
        return newOrder;
      });
    }
    setDraggingColKey(null);
    setDragOverColKey(null);
  }, []);

  const handleColumnDragEnd = useCallback(() => {
    setDraggingColKey(null);
    setDragOverColKey(null);
  }, []);

  // Resize handler
  const handleColumnResize = useCallback((key: string, newWidth: number) => {
    const index = columns.findIndex((c) => c.key === key);
    if (index === -1) return;
    setResizableColumnWidths((prev) => {
      const next = [...prev];
      next[index] = newWidth;
      return next;
    });
  }, []);

  return (
    <DemoContainer title="Table">
      <DemoMutedText size={12}>
        Composable table components with sortable headers and drag-and-drop column reordering.
      </DemoMutedText>

      <DemoSection label="Basic Table">
        <div
          style={{
            border: "1px solid var(--rei-color-border, #e5e7eb)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <TableHeader columns={columns.slice(0, 4) as TableColumnDef[]} sticky={false} />
          <TableBody>
            {sampleData.map((row, i) => (
              <TableRow key={row.id} rowIndex={i}>
                <TableCell width={60} align="right">{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </div>
      </DemoSection>

      <DemoSection label="Sortable & Draggable Columns">
        <div style={{ marginBottom: 8 }}>
          <DemoMutedText size={11}>
            Click headers to sort. Drag headers to reorder columns.
          </DemoMutedText>
        </div>
        <div
          style={{
            border: "1px solid var(--rei-color-border, #e5e7eb)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <TableHeader
            columns={orderedColumns as TableColumnDef[]}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            draggingColumnKey={draggingColKey}
            dragOverColumnKey={dragOverColKey}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onColumnDragEnd={handleColumnDragEnd}
            sticky={false}
          />
          <TableBody>
            {sortedData.map((row, i) => (
              <TableRow
                key={row.id}
                rowIndex={i}
                selected={selectedRowIndex === i}
                onClick={() => setSelectedRowIndex(i)}
              >
                {orderedColumns.map((col) => {
                  const value = row[col.key as keyof Person];
                  return (
                    <TableCell
                      key={col.key}
                      width={col.width}
                      align={col.align}
                    >
                      {col.render ? col.render(value, row, i) : String(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </div>
      </DemoSection>

      <DemoSection label="Row Selection">
        <div style={{ marginBottom: 8 }}>
          <DemoMutedText size={11}>
            Click rows to select. Selected row index: {selectedRowIndex ?? "none"}
          </DemoMutedText>
        </div>
        <div
          style={{
            border: "1px solid var(--rei-color-border, #e5e7eb)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <TableHeader columns={columns.slice(0, 3) as TableColumnDef[]} sticky={false} />
          <TableBody>
            {sampleData.map((row, i) => (
              <TableRow
                key={row.id}
                rowIndex={i}
                selected={selectedRowIndex === i}
                onClick={() => setSelectedRowIndex(i)}
              >
                <TableCell width={60} align="right">{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </div>
      </DemoSection>

      <DemoSection label="Resizable Columns">
        <div style={{ marginBottom: 8 }}>
          <DemoMutedText size={11}>
            Drag column borders to resize. Click header to sort. Current widths: {resizableColumnWidths.join(", ")}px
          </DemoMutedText>
        </div>
        <div
          style={{
            border: "1px solid var(--rei-color-border, #e5e7eb)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <TableHeader
            columns={columns as TableColumnDef[]}
            columnWidths={resizableColumnWidths}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            resizable
            onColumnResize={handleColumnResize}
            sticky={false}
          />
          <TableBody>
            {sampleData.map((row, i) => (
              <TableRow key={row.id} rowIndex={i}>
                {columns.map((col, colIndex) => {
                  const value = row[col.key as keyof Person];
                  return (
                    <TableCell
                      key={col.key}
                      width={resizableColumnWidths[colIndex]}
                      align={col.align}
                    >
                      {col.render ? col.render(value, row, i) : String(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
