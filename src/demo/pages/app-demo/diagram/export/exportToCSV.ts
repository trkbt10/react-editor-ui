/**
 * @file CSV export for table nodes in diagram documents
 */

import type {
  DiagramNode,
  FrameNode,
  TableNode,
} from "../types";

// =============================================================================
// Type Guards
// =============================================================================

function isTableNode(node: DiagramNode): node is TableNode {
  return node.type === "table";
}

// =============================================================================
// CSV Helpers
// =============================================================================

/**
 * Escape a value for CSV format (RFC 4180 compliant)
 * - Values containing commas, double quotes, or newlines are enclosed in double quotes
 * - Double quotes within values are escaped by doubling them
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert a table node to CSV format
 */
export function tableToCSV(table: TableNode): string {
  return table.cells
    .map((row) =>
      row.map((cell) => escapeCSVValue(cell.content)).join(","),
    )
    .join("\n");
}

// =============================================================================
// Export Functions
// =============================================================================

/**
 * Export a single table node to CSV
 */
export function exportTableToCSV(table: TableNode): string {
  return tableToCSV(table);
}

/**
 * Export all tables within a frame to CSV
 * Each table is separated by a blank line and prefixed with a comment
 */
export function exportFrameTablesToCSV(
  frame: FrameNode,
  allNodes: DiagramNode[],
): string {
  const childNodeIds = new Set(frame.children);
  const tables = allNodes
    .filter((n): n is TableNode => childNodeIds.has(n.id) && isTableNode(n));

  if (tables.length === 0) {
    return "# No tables found in this frame";
  }

  if (tables.length === 1) {
    return tableToCSV(tables[0]);
  }

  // Multiple tables: add comments to separate them
  return tables
    .map((table, index) => {
      const header = `# Table ${index + 1}: ${table.id}`;
      const csv = tableToCSV(table);
      return `${header}\n${csv}`;
    })
    .join("\n\n");
}

/**
 * Export all tables from nodes to CSV
 */
export function exportAllTablesToCSV(nodes: DiagramNode[]): string {
  const tables = nodes.filter(isTableNode);

  if (tables.length === 0) {
    return "# No tables found";
  }

  if (tables.length === 1) {
    return tableToCSV(tables[0]);
  }

  return tables
    .map((table, index) => {
      const header = `# Table ${index + 1}: ${table.id}`;
      const csv = tableToCSV(table);
      return `${header}\n${csv}`;
    })
    .join("\n\n");
}
