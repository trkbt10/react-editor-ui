/**
 * @file SymbolInstanceRenderer - Renders a symbol instance by resolving its symbol definition with variants
 */

import { memo, useMemo, useCallback, useRef, useEffect, type CSSProperties } from "react";
import type {
  SymbolInstance,
  SymbolDefinition,
  SymbolPart,
  ShapePart,
  TextPart,
  ShapeType,
} from "../types";

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
// Type Guards
// =============================================================================

function isShapePart(part: SymbolPart): part is ShapePart {
  return part.type === "shape";
}

function isTextPart(part: SymbolPart): part is TextPart {
  return part.type === "text";
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

// =============================================================================
// Part Renderers
// =============================================================================

type ShapePartRendererProps = {
  part: ShapePart;
  width: number;
  height: number;
};

const ShapePartRenderer = memo(function ShapePartRenderer({
  part,
  width,
  height,
}: ShapePartRendererProps) {
  const shapePath = getShapePath(part.shape, width, height);

  const fillColor = part.fill.visible
    ? `${part.fill.hex}${Math.round((part.fill.opacity / 100) * 255).toString(16).padStart(2, "0")}`
    : "none";

  const strokeColor = part.stroke.color.visible
    ? `${part.stroke.color.hex}${Math.round((part.stroke.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
    : "none";

  const strokeDashArray = useMemo(() => {
    switch (part.stroke.style) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,4";
      default:
        return undefined;
    }
  }, [part.stroke.style]);

  return (
    <svg
      style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={shapePath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={part.stroke.width}
        strokeDasharray={strokeDashArray}
      />
    </svg>
  );
});

type TextPartRendererProps = {
  part: TextPart;
  editing: boolean;
  onContentChange: (partId: string, content: string) => void;
  onEditEnd: () => void;
};

const TextPartRenderer = memo(function TextPartRenderer({
  part,
  editing,
  onContentChange,
  onEditEnd,
}: TextPartRendererProps) {
  const inputRef = useRef<HTMLSpanElement>(null);
  const initialContentRef = useRef<string>(part.content);

  // Focus and select all when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      initialContentRef.current = part.content;
      inputRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing, part.content]);

  const handleBlur = useCallback(() => {
    const newContent = inputRef.current?.textContent ?? part.content;
    onContentChange(part.id, newContent);
    onEditEnd();
  }, [part.id, part.content, onContentChange, onEditEnd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const newContent = inputRef.current?.textContent ?? part.content;
        onContentChange(part.id, newContent);
        onEditEnd();
      } else if (e.key === "Escape") {
        if (inputRef.current) {
          inputRef.current.textContent = initialContentRef.current;
        }
        onEditEnd();
      } else if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
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
        e.stopPropagation();
      }
    },
    [part.id, part.content, onContentChange, onEditEnd],
  );

  const textStyle = useMemo<CSSProperties>(() => {
    const props = part.textProps;
    return {
      ...textDisplayBaseStyle,
      fontSize: props.fontSize,
      fontWeight: props.fontWeight,
      textAlign: props.textAlign,
      color: props.color.visible
        ? `${props.color.hex}${Math.round((props.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
        : "transparent",
    };
  }, [part.textProps]);

  const editableStyle = useMemo<CSSProperties>(() => {
    const props = part.textProps;
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
  }, [part.textProps]);

  const containerStyle = useMemo<CSSProperties>(() => ({
    ...textContainerStyle,
    pointerEvents: editing ? "auto" : "none",
  }), [editing]);

  return (
    <div style={containerStyle}>
      {editing ? (
        <span
          ref={inputRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={editableStyle}
          data-testid="symbol-text-content-editable"
          dangerouslySetInnerHTML={{ __html: part.content }}
        />
      ) : (
        <span style={textStyle} data-testid="symbol-text-content-display">
          {part.content}
        </span>
      )}
    </div>
  );
});

// =============================================================================
// Merge Part with Overrides
// =============================================================================

function mergePartWithOverrides(
  basePart: SymbolPart,
  variantOverride?: Partial<SymbolPart>,
  instanceOverride?: Partial<SymbolPart>,
): SymbolPart {
  if (isShapePart(basePart)) {
    const merged: ShapePart = { ...basePart };

    // Apply variant override
    if (variantOverride) {
      if ("shape" in variantOverride && variantOverride.shape) {
        merged.shape = variantOverride.shape;
      }
      if ("fill" in variantOverride && variantOverride.fill) {
        merged.fill = { ...merged.fill, ...variantOverride.fill };
      }
      if ("stroke" in variantOverride && variantOverride.stroke) {
        merged.stroke = { ...merged.stroke, ...variantOverride.stroke };
      }
    }

    // Apply instance override
    if (instanceOverride) {
      if ("shape" in instanceOverride && instanceOverride.shape) {
        merged.shape = instanceOverride.shape;
      }
      if ("fill" in instanceOverride && instanceOverride.fill) {
        merged.fill = { ...merged.fill, ...instanceOverride.fill };
      }
      if ("stroke" in instanceOverride && instanceOverride.stroke) {
        merged.stroke = { ...merged.stroke, ...instanceOverride.stroke };
      }
    }

    return merged;
  }

  if (isTextPart(basePart)) {
    const merged: TextPart = { ...basePart };

    // Apply variant override
    if (variantOverride) {
      if ("content" in variantOverride && variantOverride.content !== undefined) {
        merged.content = variantOverride.content;
      }
      if ("textProps" in variantOverride && variantOverride.textProps) {
        merged.textProps = { ...merged.textProps, ...variantOverride.textProps };
      }
    }

    // Apply instance override
    if (instanceOverride) {
      if ("content" in instanceOverride && instanceOverride.content !== undefined) {
        merged.content = instanceOverride.content;
      }
      if ("textProps" in instanceOverride && instanceOverride.textProps) {
        merged.textProps = { ...merged.textProps, ...instanceOverride.textProps };
      }
    }

    return merged;
  }

  return basePart;
}

// =============================================================================
// Find first text part ID
// =============================================================================

export function findFirstTextPartId(symbolDef: SymbolDefinition | null): string | null {
  if (!symbolDef) return null;
  const textPart = symbolDef.parts.find(isTextPart);
  return textPart?.id ?? null;
}

// =============================================================================
// Main Component
// =============================================================================

type SymbolInstanceRendererProps = {
  instance: SymbolInstance;
  symbolDef: SymbolDefinition | null;
  selected: boolean;
  /** Part ID being edited (null = not editing) */
  editingPartId?: string | null;
  /** Callback when part content changes */
  onPartContentChange?: (instanceId: string, partId: string, content: string) => void;
  /** Callback when editing ends */
  onEditEnd?: () => void;
};

export const SymbolInstanceRenderer = memo(function SymbolInstanceRenderer({
  instance,
  symbolDef,
  selected,
  editingPartId = null,
  onPartContentChange,
  onEditEnd = () => {},
}: SymbolInstanceRendererProps) {
  // Get variant
  const variant = useMemo(() => {
    if (!symbolDef) return null;
    return symbolDef.variants[instance.variantId] ?? null;
  }, [symbolDef, instance.variantId]);

  // Resolve parts with variant and instance overrides
  const resolvedParts = useMemo(() => {
    if (!symbolDef) return [];

    return symbolDef.parts.map((basePart) => {
      const variantOverride = variant?.parts[basePart.id];
      const instanceOverride = instance.partOverrides?.[basePart.id];
      return mergePartWithOverrides(basePart, variantOverride, instanceOverride);
    });
  }, [symbolDef, variant, instance.partOverrides]);

  const handleContentChange = useCallback(
    (partId: string, content: string) => {
      onPartContentChange?.(instance.id, partId, content);
    },
    [instance.id, onPartContentChange],
  );

  const isEditing = editingPartId !== null;

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      cursor: isEditing ? "text" : selected ? "move" : "pointer",
      outline: isEditing ? "2px solid var(--rei-color-primary, #18a0fb)" : undefined,
      outlineOffset: isEditing ? 2 : undefined,
      borderRadius: isEditing ? 2 : undefined,
    }),
    [selected, isEditing],
  );

  if (!symbolDef) {
    // Symbol not found - render placeholder
    return (
      <div style={containerStyle}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed red",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "red",
          }}
        >
          Symbol not found
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-testid={`symbol-instance-${instance.id}`}>
      {resolvedParts.map((part) => {
        if (isShapePart(part)) {
          return (
            <ShapePartRenderer
              key={part.id}
              part={part}
              width={instance.width}
              height={instance.height}
            />
          );
        }

        if (isTextPart(part)) {
          return (
            <TextPartRenderer
              key={part.id}
              part={part}
              editing={editingPartId === part.id}
              onContentChange={handleContentChange}
              onEditEnd={onEditEnd}
            />
          );
        }

        return null;
      })}
    </div>
  );
});
