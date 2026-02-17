/**
 * @file NodeRenderer - Renders individual diagram nodes (shapes, text, groups)
 */

import { memo, useCallback, useMemo, useRef, useEffect, useState, type CSSProperties } from "react";
import type { DiagramNode, ShapeNode, TextNode, GroupNode, ShapeType } from "../types";

// =============================================================================
// Shape Path Generators
// =============================================================================

function getShapePath(type: ShapeType, width: number, height: number): string {
  const w = width;
  const h = height;
  const hw = w / 2;
  const hh = h / 2;

  switch (type) {
    case "rectangle":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;

    case "rounded-rect": {
      const r = Math.min(10, w * 0.1, h * 0.1);
      return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
    }

    case "ellipse":
      return `M ${hw} 0 A ${hw} ${hh} 0 1 1 ${hw} ${h} A ${hw} ${hh} 0 1 1 ${hw} 0 Z`;

    case "diamond":
      return `M ${hw} 0 L ${w} ${hh} L ${hw} ${h} L 0 ${hh} Z`;

    case "triangle":
      return `M ${hw} 0 L ${w} ${h} L 0 ${h} Z`;

    case "hexagon": {
      const offset = w * 0.25;
      return `M ${offset} 0 L ${w - offset} 0 L ${w} ${hh} L ${w - offset} ${h} L ${offset} ${h} L 0 ${hh} Z`;
    }

    case "parallelogram": {
      const skew = w * 0.2;
      return `M ${skew} 0 L ${w} 0 L ${w - skew} ${h} L 0 ${h} Z`;
    }

    case "cylinder": {
      const ry = h * 0.1;
      return `M 0 ${ry} A ${hw} ${ry} 0 0 1 ${w} ${ry} L ${w} ${h - ry} A ${hw} ${ry} 0 0 1 0 ${h - ry} Z M 0 ${ry} A ${hw} ${ry} 0 0 0 ${w} ${ry}`;
    }

    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  }
}

// =============================================================================
// Styles
// =============================================================================

const textContainerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  padding: 4,
};

const textDisplayBaseStyle: CSSProperties = {
  fontSize: 14,
  color: "var(--rei-color-text)",
  textAlign: "center",
  wordBreak: "break-word",
  lineHeight: 1.3,
  userSelect: "none",
};

const groupBorderStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  border: "1px dashed rgba(0, 0, 0, 0.2)",
  borderRadius: 2,
  pointerEvents: "none",
};

// =============================================================================
// Type Guards
// =============================================================================

function isShapeNode(node: DiagramNode): node is ShapeNode {
  return node.type !== "text" && node.type !== "group" && node.type !== "instance" && node.type !== "frame";
}

function isTextNode(node: DiagramNode): node is TextNode {
  return node.type === "text";
}

function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === "group";
}

// =============================================================================
// Shape Renderer
// =============================================================================

type ShapeRendererProps = {
  node: ShapeNode;
  selected: boolean;
};

const ShapeRenderer = memo(function ShapeRenderer({ node, selected }: ShapeRendererProps) {
  const shapePath = useMemo(
    () => getShapePath(node.type, node.width, node.height),
    [node.type, node.width, node.height],
  );

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      cursor: selected ? "move" : "pointer",
    }),
    [selected],
  );

  const svgStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }),
    [],
  );

  const fillColor = node.fill.visible
    ? `${node.fill.hex}${Math.round((node.fill.opacity / 100) * 255).toString(16).padStart(2, "0")}`
    : "none";

  const strokeColor = node.stroke.color.visible
    ? `${node.stroke.color.hex}${Math.round((node.stroke.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
    : "none";

  const strokeDashArray = useMemo(() => {
    switch (node.stroke.style) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,4";
      default:
        return undefined;
    }
  }, [node.stroke.style]);

  return (
    <div style={containerStyle}>
      <svg style={svgStyle} viewBox={`0 0 ${node.width} ${node.height}`}>
        <path
          d={shapePath}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={node.stroke.width}
          strokeDasharray={strokeDashArray}
        />
      </svg>
    </div>
  );
});

// =============================================================================
// Text Renderer
// =============================================================================

type TextRendererProps = {
  node: TextNode;
  selected: boolean;
  editing: boolean;
  onContentChange: (nodeId: string, content: string) => void;
  onEditEnd: () => void;
};

const TextRenderer = memo(function TextRenderer({
  node,
  selected,
  editing,
  onContentChange,
  onEditEnd,
}: TextRendererProps) {
  const inputRef = useRef<HTMLSpanElement>(null);
  const initialContentRef = useRef<string>(node.content);

  // Focus and select all when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      // Store initial content for escape key
      initialContentRef.current = node.content;
      // Focus and select all
      inputRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing, node.content]);

  const handleBlur = useCallback(() => {
    const newContent = inputRef.current?.textContent ?? node.content;
    onContentChange(node.id, newContent);
    onEditEnd();
  }, [node.id, node.content, onContentChange, onEditEnd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const newContent = inputRef.current?.textContent ?? node.content;
        onContentChange(node.id, newContent);
        onEditEnd();
      } else if (e.key === "Escape") {
        // Restore original content
        if (inputRef.current) {
          inputRef.current.textContent = initialContentRef.current;
        }
        onEditEnd();
      } else if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        // Handle Cmd/Ctrl+A to select all text (ensure it works in contentEditable)
        e.preventDefault();
        e.stopPropagation();
        if (inputRef.current) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(inputRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      } else {
        // Stop propagation for all other keys to prevent interference from parent handlers
        e.stopPropagation();
      }
    },
    [node.id, node.content, onContentChange, onEditEnd],
  );

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      cursor: editing ? "text" : selected ? "move" : "pointer",
      outline: editing ? "2px solid var(--rei-color-primary, #18a0fb)" : undefined,
      outlineOffset: editing ? 2 : undefined,
      borderRadius: editing ? 2 : undefined,
    }),
    [selected, editing],
  );

  const textStyle = useMemo<CSSProperties>(() => {
    const props = node.textProps;
    return {
      ...textDisplayBaseStyle,
      fontSize: props.fontSize,
      fontWeight: props.fontWeight,
      textAlign: props.textAlign,
      color: props.color.visible
        ? `${props.color.hex}${Math.round((props.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
        : "transparent",
    };
  }, [node.textProps]);

  const editableStyle = useMemo<CSSProperties>(() => {
    const props = node.textProps;
    return {
      ...textDisplayBaseStyle,
      fontSize: props.fontSize,
      fontWeight: props.fontWeight,
      textAlign: props.textAlign,
      color: props.color.visible
        ? `${props.color.hex}${Math.round((props.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
        : "transparent",
      outline: "none",
      cursor: "text",
      pointerEvents: "auto",
      userSelect: "text",
      minWidth: 20,
    };
  }, [node.textProps]);

  const innerContainerStyle = useMemo<CSSProperties>(() => ({
    ...textContainerStyle,
    pointerEvents: editing ? "auto" : "none",
  }), [editing]);

  return (
    <div style={containerStyle} data-testid={`text-node-${node.id}`}>
      <div style={innerContainerStyle}>
        {editing ? (
          <span
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={editableStyle}
            data-testid="text-content-editable"
            dangerouslySetInnerHTML={{ __html: node.content }}
          />
        ) : (
          <span style={textStyle} data-testid="text-content-display">
            {node.content}
          </span>
        )}
      </div>
    </div>
  );
});

// =============================================================================
// Group Renderer (renders bounding box only - children rendered separately)
// =============================================================================

type GroupRendererProps = {
  node: GroupNode;
  selected: boolean;
};

const GroupRenderer = memo(function GroupRenderer({ node, selected }: GroupRendererProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      transform: node.rotation !== 0 ? `rotate(${node.rotation}deg)` : undefined,
      transformOrigin: "center center",
      cursor: selected ? "move" : "pointer",
    }),
    [node.rotation, selected],
  );

  // Group itself is invisible - just a container
  // Show dashed border only when selected for debugging
  return (
    <div style={containerStyle}>
      {selected && <div style={groupBorderStyle} />}
    </div>
  );
});

// =============================================================================
// Main NodeRenderer
// =============================================================================

type NodeRendererProps = {
  node: DiagramNode;
  selected: boolean;
  editing?: boolean;
  onContentChange: (nodeId: string, content: string) => void;
  onEditEnd?: () => void;
};

export const NodeRenderer = memo(function NodeRenderer({
  node,
  selected,
  editing = false,
  onContentChange,
  onEditEnd = () => {},
}: NodeRendererProps) {
  if (isShapeNode(node)) {
    return <ShapeRenderer node={node} selected={selected} />;
  }

  if (isTextNode(node)) {
    return (
      <TextRenderer
        node={node}
        selected={selected}
        editing={editing}
        onContentChange={onContentChange}
        onEditEnd={onEditEnd}
      />
    );
  }

  if (isGroupNode(node)) {
    return <GroupRenderer node={node} selected={selected} />;
  }

  return null;
});

// =============================================================================
// Exports
// =============================================================================

export { getShapePath, isShapeNode, isTextNode, isGroupNode };
