/**
 * @file TableRenderer - Renders table nodes with editable cells
 */

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
} from "react";
import type { TableNode, TableCell, TextProperties } from "../types";

// =============================================================================
// Types
// =============================================================================

export type TableEditingState = {
  nodeId: string;
  rowIndex: number;
  colIndex: number;
} | null;

export type TableRendererProps = {
  node: TableNode;
  selected: boolean;
  editingCell?: { rowIndex: number; colIndex: number } | null;
  onCellContentChange?: (nodeId: string, rowIndex: number, colIndex: number, content: string) => void;
  onEditEnd?: () => void;
};

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
};

const tableStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

const baseCellStyle: CSSProperties = {
  padding: 4,
  verticalAlign: "middle",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  userSelect: "none",
};

const headerCellStyle: CSSProperties = {
  ...baseCellStyle,
  fontWeight: "bold",
  backgroundColor: "rgba(0, 0, 0, 0.05)",
};

const editableStyle: CSSProperties = {
  outline: "none",
  cursor: "text",
  userSelect: "text",
  minWidth: 20,
  display: "inline-block",
  width: "100%",
};

// =============================================================================
// Cell Editor Component
// =============================================================================

type CellEditorProps = {
  content: string;
  textProps: TextProperties;
  onContentChange: (content: string) => void;
  onEditEnd: () => void;
};

const CellEditor = memo(function CellEditor({
  content,
  textProps,
  onContentChange,
  onEditEnd,
}: CellEditorProps) {
  const inputRef = useRef<HTMLSpanElement>(null);
  const initialContentRef = useRef<string>(content);

  useEffect(() => {
    if (inputRef.current) {
      initialContentRef.current = content;
      inputRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [content]);

  const handleBlur = useCallback(() => {
    const newContent = inputRef.current?.textContent ?? content;
    onContentChange(newContent);
    onEditEnd();
  }, [content, onContentChange, onEditEnd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const newContent = inputRef.current?.textContent ?? content;
        onContentChange(newContent);
        onEditEnd();
      } else if (e.key === "Escape") {
        if (inputRef.current) {
          inputRef.current.textContent = initialContentRef.current;
        }
        onEditEnd();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const newContent = inputRef.current?.textContent ?? content;
        onContentChange(newContent);
        onEditEnd();
      } else {
        e.stopPropagation();
      }
    },
    [content, onContentChange, onEditEnd],
  );

  const style = useMemo<CSSProperties>(() => ({
    ...editableStyle,
    fontSize: textProps.fontSize,
    fontWeight: textProps.fontWeight,
    textAlign: textProps.textAlign,
    color: textProps.color.visible
      ? `${textProps.color.hex}${Math.round((textProps.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
      : "transparent",
  }), [textProps]);

  return (
    <span
      ref={inputRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={style}
      data-testid="table-cell-editor"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

// =============================================================================
// Cell Renderer Component
// =============================================================================

type CellRendererProps = {
  cell: TableCell;
  defaultTextProps: TextProperties;
  isHeader: boolean;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onEditEnd: () => void;
};

const CellRenderer = memo(function CellRenderer({
  cell,
  defaultTextProps,
  isHeader,
  isEditing,
  onContentChange,
  onEditEnd,
}: CellRendererProps) {
  const textProps = useMemo<TextProperties>(() => ({
    ...defaultTextProps,
    ...cell.textProps,
  }), [defaultTextProps, cell.textProps]);

  const textStyle = useMemo<CSSProperties>(() => ({
    fontSize: textProps.fontSize,
    fontWeight: isHeader ? "bold" : textProps.fontWeight,
    textAlign: textProps.textAlign,
    color: textProps.color.visible
      ? `${textProps.color.hex}${Math.round((textProps.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
      : "transparent",
  }), [textProps, isHeader]);

  if (isEditing) {
    return (
      <CellEditor
        content={cell.content}
        textProps={textProps}
        onContentChange={onContentChange}
        onEditEnd={onEditEnd}
      />
    );
  }

  return (
    <span style={textStyle} data-testid="table-cell-content">
      {cell.content || "\u00A0"}
    </span>
  );
});

// =============================================================================
// Main TableRenderer Component
// =============================================================================

export const TableRenderer = memo(function TableRenderer({
  node,
  selected,
  editingCell,
  onCellContentChange,
  onEditEnd,
}: TableRendererProps) {
  const strokeColor = node.stroke.color.visible
    ? `${node.stroke.color.hex}${Math.round((node.stroke.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
    : "transparent";

  const strokeStyle = useMemo(() => {
    switch (node.stroke.style) {
      case "dashed":
        return "dashed";
      case "dotted":
        return "dotted";
      default:
        return "solid";
    }
  }, [node.stroke.style]);

  const cellBorderStyle = useMemo(() =>
    `${node.stroke.width}px ${strokeStyle} ${strokeColor}`,
    [node.stroke.width, strokeStyle, strokeColor],
  );

  const wrapperStyle = useMemo<CSSProperties>(() => ({
    ...containerStyle,
    cursor: selected ? "move" : "pointer",
  }), [selected]);

  const handleCellContentChange = useCallback(
    (rowIndex: number, colIndex: number, content: string) => {
      onCellContentChange?.(node.id, rowIndex, colIndex, content);
    },
    [node.id, onCellContentChange],
  );

  return (
    <div style={wrapperStyle} data-testid={`table-node-${node.id}`}>
      <table style={tableStyle}>
        <tbody>
          {node.cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isHeader = node.hasHeaderRow && rowIndex === 0;
                const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;

                const cellStyle: CSSProperties = {
                  ...(isHeader ? headerCellStyle : baseCellStyle),
                  width: node.columnWidths[colIndex],
                  height: node.rowHeights[rowIndex],
                  border: cellBorderStyle,
                  pointerEvents: isEditing ? "auto" : "none",
                };

                return (
                  <td key={colIndex} style={cellStyle} data-testid={`table-cell-${rowIndex}-${colIndex}`}>
                    <CellRenderer
                      cell={cell}
                      defaultTextProps={node.defaultTextProps}
                      isHeader={isHeader}
                      isEditing={isEditing}
                      onContentChange={(content) => handleCellContentChange(rowIndex, colIndex, content)}
                      onEditEnd={onEditEnd ?? (() => {})}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
