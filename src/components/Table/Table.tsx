/**
 * @file Table component - Flexible table with sortable headers and drag reorder
 *
 * @description
 * A composable table component with sticky headers, sortable columns, and
 * drag-and-drop column reordering. Designed for data display with external
 * data management (sorting, filtering logic provided by consumer).
 *
 * @example
 * ```tsx
 * import {
 *   TableHeader,
 *   TableBody,
 *   TableRow,
 *   TableCell,
 * } from "react-editor-ui/Table";
 *
 * const columns = [
 *   { key: "name", label: "Name", sortable: true },
 *   { key: "age", label: "Age", sortable: true, align: "right" },
 * ];
 *
 * <TableHeader
 *   columns={columns}
 *   sortKey={sortKey}
 *   sortDirection={sortDirection}
 *   onSort={(key) => handleSort(key)}
 * />
 * <TableBody>
 *   {rows.map((row, i) => (
 *     <TableRow key={i} rowIndex={i}>
 *       <TableCell>{row.name}</TableCell>
 *       <TableCell align="right">{row.age}</TableCell>
 *     </TableRow>
 *   ))}
 * </TableBody>
 * ```
 */

// Export all components
export { TableHeader } from "./TableHeader";
export { TableHeaderCell } from "./TableHeaderCell";
export { TableBody } from "./TableBody";
export { TableRow } from "./TableRow";
export { TableCell } from "./TableCell";

// Export types
export type {
  SortDirection,
  CellAlign,
  TableColumnDef,
  TableHeaderProps,
  TableHeaderCellProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
} from "./types";
