/**
 * @file NodeRenderer - Renders individual diagram nodes (shapes, text, groups)
 */

import { memo, useCallback, useMemo, useRef, useEffect, useState, type CSSProperties } from "react";
import type { DiagramNode, ShapeNode, TextNode, GroupNode, ShapeType, WidthProfile, BrushType, BrushDirection } from "../types";

// =============================================================================
// Stroke Settings Type
// =============================================================================

type StrokeSettings = {
  widthProfile: WidthProfile;
  frequency: number;
  wiggle: number;
  smoothen: number;
  brushType: BrushType;
  brushDirection: BrushDirection;
};

// =============================================================================
// Shape Path Generators
// =============================================================================

type Point = { x: number; y: number };

/**
 * Parse path string into points array
 */
function parsePathToPoints(pathStr: string): Point[] {
  const points: Point[] = [];
  const matches = pathStr.match(/[MLQ]\s*([\d.-]+)\s+([\d.-]+)/g);
  if (matches) {
    for (const match of matches) {
      const coords = match.match(/[MLQ]\s*([\d.-]+)\s+([\d.-]+)/);
      if (coords) {
        points.push({ x: parseFloat(coords[1]), y: parseFloat(coords[2]) });
      }
    }
  }
  return points;
}

/**
 * Apply wiggle effect to path
 */
function applyWiggleToPath(pathStr: string, frequency: number, wiggle: number): string {
  if (frequency === 0 || wiggle === 0) return pathStr;

  const points = parsePathToPoints(pathStr);
  if (points.length < 2) return pathStr;

  const newPoints: Point[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1];
    const end = points[i];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      newPoints.push(end);
      continue;
    }

    const numSubdivisions = Math.max(1, Math.round(length * frequency / 100));

    for (let j = 1; j <= numSubdivisions; j++) {
      const t = j / numSubdivisions;
      const x = start.x + dx * t;
      const y = start.y + dy * t;

      const perpX = -dy / length;
      const perpY = dx / length;
      const wiggleAmount = Math.sin(j * Math.PI) * wiggle * 0.3;

      newPoints.push({
        x: x + perpX * wiggleAmount,
        y: y + perpY * wiggleAmount,
      });
    }
  }

  let result = `M ${newPoints[0].x} ${newPoints[0].y}`;
  for (let i = 1; i < newPoints.length; i++) {
    result += ` L ${newPoints[i].x} ${newPoints[i].y}`;
  }
  result += " Z";
  return result;
}

/**
 * Get width multiplier for a given position along the path
 */
function getWidthMultiplier(profile: WidthProfile, progress: number): number {
  switch (profile) {
    case "taper-start":
      return 0.2 + progress * 0.8;
    case "taper-end":
      return 1 - progress * 0.8;
    case "taper-both":
      return progress < 0.5
        ? 0.2 + progress * 1.6
        : 1 - (progress - 0.5) * 1.6;
    default:
      return 1;
  }
}

/**
 * Generate outline path for variable width stroke (closed shapes)
 */
function generateShapeOutlinePath(
  pathStr: string,
  baseWidth: number,
  profile: WidthProfile,
): string {
  if (profile === "uniform") return "";

  const points = parsePathToPoints(pathStr);
  if (points.length < 3) return "";

  // Calculate total perimeter length
  let totalLength = 0;
  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    const dx = next.x - points[i].x;
    const dy = next.y - points[i].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Generate inner and outer edges
  const outerEdge: Point[] = [];
  const innerEdge: Point[] = [];
  let currentLength = 0;

  for (let i = 0; i < points.length; i++) {
    const progress = totalLength > 0 ? currentLength / totalLength : 0;
    const widthMultiplier = getWidthMultiplier(profile, progress);
    const halfWidth = (baseWidth * widthMultiplier) / 2;

    // Calculate normal direction (perpendicular to edge)
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    let normalX = 0, normalY = 0;
    if (len > 0) {
      normalX = -dy / len;
      normalY = dx / len;
    }

    outerEdge.push({
      x: points[i].x + normalX * halfWidth,
      y: points[i].y + normalY * halfWidth,
    });
    innerEdge.push({
      x: points[i].x - normalX * halfWidth,
      y: points[i].y - normalY * halfWidth,
    });

    // Update current length
    const nextIdx = (i + 1) % points.length;
    const edgeDx = points[nextIdx].x - points[i].x;
    const edgeDy = points[nextIdx].y - points[i].y;
    currentLength += Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
  }

  // Build closed outline path (outer + inner reversed)
  let result = `M ${outerEdge[0].x} ${outerEdge[0].y}`;
  for (let i = 1; i < outerEdge.length; i++) {
    result += ` L ${outerEdge[i].x} ${outerEdge[i].y}`;
  }
  result += ` L ${outerEdge[0].x} ${outerEdge[0].y}`;
  result += ` M ${innerEdge[0].x} ${innerEdge[0].y}`;
  for (let i = innerEdge.length - 1; i >= 0; i--) {
    result += ` L ${innerEdge[i].x} ${innerEdge[i].y}`;
  }
  result += " Z";

  return result;
}

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

const textContainerBaseStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  pointerEvents: "none",
  padding: 4,
};

const textDisplayBaseStyle: CSSProperties = {
  wordBreak: "break-word",
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
  // Base shape path
  const basePath = useMemo(
    () => getShapePath(node.shape, node.width, node.height),
    [node.shape, node.width, node.height],
  );

  // Stroke settings
  const strokeSettings: StrokeSettings = useMemo(() => ({
    widthProfile: node.stroke.widthProfile ?? "uniform",
    frequency: node.stroke.frequency ?? 0,
    wiggle: node.stroke.wiggle ?? 0,
    smoothen: node.stroke.smoothen ?? 0,
    brushType: node.stroke.brushType ?? "smooth",
    brushDirection: node.stroke.brushDirection ?? "left",
  }), [
    node.stroke.widthProfile,
    node.stroke.frequency,
    node.stroke.wiggle,
    node.stroke.smoothen,
    node.stroke.brushType,
    node.stroke.brushDirection,
  ]);

  // Apply wiggle effect to path
  const shapePath = useMemo(() => {
    if (!basePath) return "";
    return applyWiggleToPath(basePath, strokeSettings.frequency, strokeSettings.wiggle);
  }, [basePath, strokeSettings.frequency, strokeSettings.wiggle]);

  // Generate outline path for variable width
  const outlinePath = useMemo(() => {
    if (!shapePath || strokeSettings.widthProfile === "uniform") return "";
    return generateShapeOutlinePath(shapePath, node.stroke.width, strokeSettings.widthProfile);
  }, [shapePath, node.stroke.width, strokeSettings.widthProfile]);

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

  // Use outline path for variable width
  const useOutline = strokeSettings.widthProfile !== "uniform" && outlinePath;

  return (
    <div style={containerStyle} data-stroke-settings={JSON.stringify(strokeSettings)}>
      <svg style={svgStyle} viewBox={`0 0 ${node.width} ${node.height}`}>
        {/* Fill shape */}
        <path d={shapePath} fill={fillColor} stroke="none" />

        {/* Variable width stroke outline */}
        {useOutline && (
          <path
            d={outlinePath}
            fill={strokeColor}
            stroke="none"
            data-width-profile={strokeSettings.widthProfile}
          />
        )}

        {/* Regular stroke */}
        {!useOutline && (
          <path
            d={shapePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={node.stroke.width}
            strokeDasharray={strokeDashArray}
            strokeLinejoin={node.stroke.join ?? "miter"}
            strokeMiterlimit={node.stroke.miterAngle ?? 4}
            data-stroke-join={node.stroke.join ?? "miter"}
            data-stroke-miterlimit={node.stroke.miterAngle ?? 4}
          />
        )}
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
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
      fontSize: props.fontSize,
      lineHeight: props.lineHeight,
      letterSpacing: props.letterSpacing,
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
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
      fontSize: props.fontSize,
      lineHeight: props.lineHeight,
      letterSpacing: props.letterSpacing,
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

  const innerContainerStyle = useMemo<CSSProperties>(() => {
    const props = node.textProps;
    // Map verticalAlign to flexbox alignItems
    const alignItemsMap: Record<string, string> = {
      top: "flex-start",
      middle: "center",
      bottom: "flex-end",
    };
    // Map textAlign to flexbox justifyContent
    const justifyContentMap: Record<string, string> = {
      left: "flex-start",
      center: "center",
      right: "flex-end",
    };
    return {
      ...textContainerBaseStyle,
      alignItems: alignItemsMap[props.verticalAlign] ?? "center",
      justifyContent: justifyContentMap[props.textAlign] ?? "center",
      pointerEvents: editing ? "auto" : "none",
    };
  }, [editing, node.textProps]);

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
