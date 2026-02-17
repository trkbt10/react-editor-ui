/**
 * @file SymbolInstanceRenderer - Renders a symbol instance by resolving its symbol definition with variants
 */

import { memo, useMemo, type CSSProperties } from "react";
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
};

const TextPartRenderer = memo(function TextPartRenderer({ part }: TextPartRendererProps) {
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

  return (
    <div style={textContainerStyle}>
      <span style={textStyle}>{part.content}</span>
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
// Main Component
// =============================================================================

type SymbolInstanceRendererProps = {
  instance: SymbolInstance;
  symbolDef: SymbolDefinition | null;
  selected: boolean;
};

export const SymbolInstanceRenderer = memo(function SymbolInstanceRenderer({
  instance,
  symbolDef,
  selected,
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

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      left: instance.x,
      top: instance.y,
      width: instance.width,
      height: instance.height,
      transform: instance.rotation !== 0 ? `rotate(${instance.rotation}deg)` : undefined,
      transformOrigin: "center center",
      cursor: selected ? "move" : "pointer",
    }),
    [instance.x, instance.y, instance.width, instance.height, instance.rotation, selected],
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
    <div style={containerStyle}>
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
          return <TextPartRenderer key={part.id} part={part} />;
        }

        return null;
      })}
    </div>
  );
});
