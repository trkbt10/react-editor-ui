/**
 * @file FrameRenderer - Renders frame containers with background, border, and label
 *
 * Figma-like behavior:
 * - Click on label or border edge to select the Frame
 * - Click inside Frame interior passes through (for child selection or marquee)
 * - Empty space inside Frame allows deselection and marquee selection
 */

import { memo, useMemo, type CSSProperties, type ReactNode, type PointerEvent } from "react";
import type { FrameNode } from "../types";
import { framePresets } from "../mockData";

// =============================================================================
// Constants
// =============================================================================

// Border hit area width (invisible clickable area around frame edge)
const BORDER_HIT_AREA = 10;

// =============================================================================
// Component
// =============================================================================

type FrameRendererProps = {
  node: FrameNode;
  selected: boolean;
  children?: ReactNode;
  onFrameSelect?: (e: PointerEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
};

export const FrameRenderer = memo(function FrameRenderer({
  node,
  selected,
  children,
  onFrameSelect,
  style: styleProp,
}: FrameRendererProps) {
  // Main container style with improved visual design
  const containerStyle = useMemo<CSSProperties>(() => ({
    position: "absolute",
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    // Improved visual: subtle background with shadow
    backgroundColor: node.showBackground && node.fill.visible
      ? node.fill.hex
      : "#ffffff",
    // More visible border
    border: selected
      ? "2px solid var(--rei-color-primary)"
      : "1px solid #d0d0d0",
    borderRadius: 2,
    // Subtle shadow for depth
    boxShadow: selected
      ? "0 0 0 3px var(--rei-color-primary-subtle), 0 4px 12px rgba(0,0,0,0.08)"
      : "0 2px 8px rgba(0,0,0,0.06)",
    // Always visible to allow label and border hit areas to be clickable
    overflow: "visible",
    transform: node.rotation !== 0 ? `rotate(${node.rotation}deg)` : undefined,
    transformOrigin: "center center",
    boxSizing: "border-box",
    // Interior pointer events pass through to canvas for marquee/deselect
    pointerEvents: "none",
    ...styleProp,
  }), [
    node.x,
    node.y,
    node.width,
    node.height,
    node.rotation,
    node.showBackground,
    node.fill.visible,
    node.fill.hex,
    selected,
    styleProp,
  ]);

  // Label style - clickable to select Frame (positioned above frame, high z-index)
  const labelStyle = useMemo<CSSProperties>(() => ({
    position: "absolute",
    top: -24,
    left: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
    color: selected ? "var(--rei-color-primary)" : "#666",
    backgroundColor: selected ? "var(--rei-color-primary-subtle)" : "#f5f5f5",
    padding: "3px 8px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    userSelect: "none",
    pointerEvents: "auto",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.15s ease",
  }), [selected]);

  // Border hit areas - clickable areas around frame edges for selection
  const borderHitStyle = useMemo(() => {
    const base: CSSProperties = {
      position: "absolute",
      pointerEvents: "auto",
      cursor: selected ? "move" : "pointer",
      // Debug: uncomment to see hit areas
      // backgroundColor: "rgba(255,0,0,0.1)",
    };
    return {
      top: { ...base, top: -BORDER_HIT_AREA / 2, left: BORDER_HIT_AREA, right: BORDER_HIT_AREA, height: BORDER_HIT_AREA } as CSSProperties,
      bottom: { ...base, bottom: -BORDER_HIT_AREA / 2, left: BORDER_HIT_AREA, right: BORDER_HIT_AREA, height: BORDER_HIT_AREA } as CSSProperties,
      left: { ...base, top: BORDER_HIT_AREA, bottom: BORDER_HIT_AREA, left: -BORDER_HIT_AREA / 2, width: BORDER_HIT_AREA } as CSSProperties,
      right: { ...base, top: BORDER_HIT_AREA, bottom: BORDER_HIT_AREA, right: -BORDER_HIT_AREA / 2, width: BORDER_HIT_AREA } as CSSProperties,
      // Corner hit areas
      topLeft: { ...base, top: -BORDER_HIT_AREA / 2, left: -BORDER_HIT_AREA / 2, width: BORDER_HIT_AREA * 1.5, height: BORDER_HIT_AREA * 1.5 } as CSSProperties,
      topRight: { ...base, top: -BORDER_HIT_AREA / 2, right: -BORDER_HIT_AREA / 2, width: BORDER_HIT_AREA * 1.5, height: BORDER_HIT_AREA * 1.5 } as CSSProperties,
      bottomLeft: { ...base, bottom: -BORDER_HIT_AREA / 2, left: -BORDER_HIT_AREA / 2, width: BORDER_HIT_AREA * 1.5, height: BORDER_HIT_AREA * 1.5 } as CSSProperties,
      bottomRight: { ...base, bottom: -BORDER_HIT_AREA / 2, right: -BORDER_HIT_AREA / 2, width: BORDER_HIT_AREA * 1.5, height: BORDER_HIT_AREA * 1.5 } as CSSProperties,
    };
  }, [selected]);

  // Children container - pointerEvents: none to allow clicks to pass through to canvas
  // Children themselves have pointerEvents: auto set by parent
  const childrenContainerStyle = useMemo<CSSProperties>(() => ({
    position: "relative",
    width: "100%",
    height: "100%",
    // Pass through pointer events - children will have their own pointerEvents: auto
    pointerEvents: "none",
    overflow: node.clipContent ? "hidden" : "visible",
  }), [node.clipContent]);

  const presetInfo = framePresets[node.preset];

  const handleFrameSelect = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFrameSelect?.(e);
  };

  return (
    <div style={containerStyle} data-frame-id={node.id}>
      {/* Frame Label - clickable */}
      <div
        style={labelStyle}
        data-frame-label={node.id}
        onPointerDown={handleFrameSelect}
      >
        {presetInfo.label}
      </div>

      {/* Border hit areas - clickable edges and corners */}
      <div style={borderHitStyle.top} data-frame-border="top" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.bottom} data-frame-border="bottom" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.left} data-frame-border="left" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.right} data-frame-border="right" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.topLeft} data-frame-border="top-left" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.topRight} data-frame-border="top-right" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.bottomLeft} data-frame-border="bottom-left" onPointerDown={handleFrameSelect} />
      <div style={borderHitStyle.bottomRight} data-frame-border="bottom-right" onPointerDown={handleFrameSelect} />

      {/* Children container - events pass through to canvas */}
      <div style={childrenContainerStyle}>
        {children}
      </div>
    </div>
  );
});
