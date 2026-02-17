/**
 * @file Tooltip component - Displays contextual information on hover
 *
 * @description
 * Shows contextual help on hover with automatic positioning.
 * Uses SVG for smooth background and arrow rendering.
 *
 * @example
 * ```tsx
 * import { Tooltip } from "react-editor-ui/Tooltip";
 *
 * <Tooltip content="Save your changes" placement="top">
 *   <button>Save</button>
 * </Tooltip>
 * ```
 */

import {
  memo,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  Z_TOOLTIP,
} from "../../themes/styles";
import { calculateFloatingPosition, rectToAnchor, type FloatingPlacement } from "../../hooks";

export type TooltipPlacement = FloatingPlacement;

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  className?: string;
  arrowSize?: number;
};

const TOOLTIP_OFFSET = 8;
const DEFAULT_ARROW_SIZE = 6;
const VIEWPORT_PADDING = 8;
const BORDER_RADIUS = 6;

/**
 * Generates an SVG path for a rounded rectangle with an arrow.
 * The arrow is positioned at the center of the side closest to the trigger.
 */
function generateTooltipPath(
  width: number,
  height: number,
  radius: number,
  arrowSize: number,
  placement: TooltipPlacement,
): string {
  const r = Math.min(radius, width / 2, height / 2);
  const halfArrow = arrowSize;

  // For top/bottom placements, arrow is on bottom/top edge
  // For left/right placements, arrow is on right/left edge
  switch (placement) {
    case "top": {
      // Arrow points down (at bottom center)
      const arrowCenterX = width / 2;
      const arrowY = height;
      return [
        `M ${r} 0`,
        `L ${width - r} 0`,
        `Q ${width} 0 ${width} ${r}`,
        `L ${width} ${height - r}`,
        `Q ${width} ${height} ${width - r} ${height}`,
        `L ${arrowCenterX + halfArrow} ${height}`,
        `L ${arrowCenterX} ${arrowY + arrowSize}`,
        `L ${arrowCenterX - halfArrow} ${height}`,
        `L ${r} ${height}`,
        `Q 0 ${height} 0 ${height - r}`,
        `L 0 ${r}`,
        `Q 0 0 ${r} 0`,
        `Z`,
      ].join(" ");
    }
    case "bottom": {
      // Arrow points up (at top center)
      const arrowCenterX = width / 2;
      return [
        `M ${r} ${arrowSize}`,
        `L ${arrowCenterX - halfArrow} ${arrowSize}`,
        `L ${arrowCenterX} 0`,
        `L ${arrowCenterX + halfArrow} ${arrowSize}`,
        `L ${width - r} ${arrowSize}`,
        `Q ${width} ${arrowSize} ${width} ${arrowSize + r}`,
        `L ${width} ${height + arrowSize - r}`,
        `Q ${width} ${height + arrowSize} ${width - r} ${height + arrowSize}`,
        `L ${r} ${height + arrowSize}`,
        `Q 0 ${height + arrowSize} 0 ${height + arrowSize - r}`,
        `L 0 ${arrowSize + r}`,
        `Q 0 ${arrowSize} ${r} ${arrowSize}`,
        `Z`,
      ].join(" ");
    }
    case "left": {
      // Arrow points right (at right center)
      const arrowCenterY = height / 2;
      return [
        `M ${r} 0`,
        `L ${width - r} 0`,
        `Q ${width} 0 ${width} ${r}`,
        `L ${width} ${arrowCenterY - halfArrow}`,
        `L ${width + arrowSize} ${arrowCenterY}`,
        `L ${width} ${arrowCenterY + halfArrow}`,
        `L ${width} ${height - r}`,
        `Q ${width} ${height} ${width - r} ${height}`,
        `L ${r} ${height}`,
        `Q 0 ${height} 0 ${height - r}`,
        `L 0 ${r}`,
        `Q 0 0 ${r} 0`,
        `Z`,
      ].join(" ");
    }
    case "right": {
      // Arrow points left (at left center)
      const arrowCenterY = height / 2;
      return [
        `M ${arrowSize + r} 0`,
        `L ${width + arrowSize - r} 0`,
        `Q ${width + arrowSize} 0 ${width + arrowSize} ${r}`,
        `L ${width + arrowSize} ${height - r}`,
        `Q ${width + arrowSize} ${height} ${width + arrowSize - r} ${height}`,
        `L ${arrowSize + r} ${height}`,
        `Q ${arrowSize} ${height} ${arrowSize} ${height - r}`,
        `L ${arrowSize} ${arrowCenterY + halfArrow}`,
        `L 0 ${arrowCenterY}`,
        `L ${arrowSize} ${arrowCenterY - halfArrow}`,
        `L ${arrowSize} ${r}`,
        `Q ${arrowSize} 0 ${arrowSize + r} 0`,
        `Z`,
      ].join(" ");
    }
  }
}

/**
 * Computes SVG dimensions based on content size and arrow placement
 */
function computeSvgDimensions(
  contentWidth: number,
  contentHeight: number,
  arrowSize: number,
  placement: TooltipPlacement,
): { width: number; height: number } {
  switch (placement) {
    case "top":
    case "bottom":
      return {
        width: contentWidth,
        height: contentHeight + arrowSize,
      };
    case "left":
    case "right":
      return {
        width: contentWidth + arrowSize,
        height: contentHeight,
      };
  }
}

/**
 * Computes the position offset for the SVG based on arrow placement
 */
function computeSvgOffset(
  arrowSize: number,
  placement: TooltipPlacement,
): { top: number; left: number } {
  switch (placement) {
    case "top":
      return { top: 0, left: 0 };
    case "bottom":
      return { top: -arrowSize, left: 0 };
    case "left":
      return { top: 0, left: 0 };
    case "right":
      return { top: 0, left: -arrowSize };
  }
}

// Note: computeRawPosition and clampToViewport have been replaced by calculateFloatingPosition from hooks

/**
 * Tooltip displays contextual information on hover.
 * Uses SVG for seamless background and arrow rendering.
 */
export const Tooltip = memo(function Tooltip({
  content,
  children,
  placement = "bottom",
  delay = 300,
  disabled = false,
  className,
  arrowSize = DEFAULT_ARROW_SIZE,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(placement);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure content size when visible
  useLayoutEffect(() => {
    if (isVisible && contentRef.current) {
      const { offsetWidth, offsetHeight } = contentRef.current;
      setContentSize({ width: offsetWidth, height: offsetHeight });
    }
  }, [isVisible, content]);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || contentSize.width === 0) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const anchor = rectToAnchor(triggerRect);

    // Calculate total floating size including arrow
    const isHorizontal = placement === "left" || placement === "right";
    const isVertical = placement === "top" || placement === "bottom";
    const floatingWidth = isHorizontal ? contentSize.width + arrowSize : contentSize.width;
    const floatingHeight = isVertical ? contentSize.height + arrowSize : contentSize.height;

    const result = calculateFloatingPosition({
      anchor,
      floatingWidth,
      floatingHeight,
      placement,
      offset: TOOLTIP_OFFSET,
      viewportPadding: VIEWPORT_PADDING,
      allowFlip: true,
      includeScrollOffset: false, // Tooltip uses fixed positioning
    });

    setPosition({ top: result.y, left: result.x });
    setActualPlacement(result.actualPlacement);
  }, [placement, contentSize, arrowSize]);

  useEffect(() => {
    if (isVisible && contentSize.width > 0) {
      calculatePosition();
    }
  }, [isVisible, calculatePosition, contentSize]);

  const handlePointerEnter = useCallback(() => {
    if (disabled) {
      return;
    }
    if (delay === 0) {
      setIsVisible(true);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [disabled, delay]);

  const handlePointerLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
    }),
    [],
  );

  // Calculate SVG dimensions and offset based on actual placement (after potential flip)
  const svgDimensions = useMemo(
    () =>
      computeSvgDimensions(
        contentSize.width,
        contentSize.height,
        arrowSize,
        actualPlacement,
      ),
    [contentSize, arrowSize, actualPlacement],
  );

  const svgOffset = useMemo(
    () => computeSvgOffset(arrowSize, actualPlacement),
    [arrowSize, actualPlacement],
  );

  // Generate SVG path based on actual placement
  const tooltipPath = useMemo(
    () =>
      generateTooltipPath(
        contentSize.width,
        contentSize.height,
        BORDER_RADIUS,
        arrowSize,
        actualPlacement,
      ),
    [contentSize, arrowSize, actualPlacement],
  );

  const tooltipContainerStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      top: position.top + svgOffset.top,
      left: position.left + svgOffset.left,
      zIndex: Z_TOOLTIP,
      pointerEvents: "none",
      opacity: isVisible && contentSize.width > 0 ? 1 : 0,
      visibility: isVisible ? "visible" : "hidden",
      transition: `opacity ${DURATION_FAST} ${EASING_DEFAULT}, visibility ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [position, svgOffset, isVisible, contentSize.width],
  );

  const svgStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      top: 0,
      left: 0,
      display: "block",
      filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
    }),
    [],
  );

  // Content offset based on actual placement (to position content within the SVG bounds)
  const contentContainerStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {
      position: "relative",
      zIndex: 1,
      padding: `${SPACE_SM} ${SPACE_MD}`,
      color: "var(--rei-tooltip-color, #ffffff)",
      fontSize: SIZE_FONT_SM,
      whiteSpace: "nowrap",
    };

    switch (actualPlacement) {
      case "top":
        return base;
      case "bottom":
        return { ...base, marginTop: arrowSize };
      case "left":
        return base;
      case "right":
        return { ...base, marginLeft: arrowSize };
    }
  }, [actualPlacement, arrowSize]);

  return (
    <>
      <div
        ref={triggerRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={className}
        style={wrapperStyle}
      >
        {children}
      </div>
      <div role="tooltip" aria-hidden={!isVisible} style={tooltipContainerStyle}>
        {/* SVG background with arrow */}
        <svg
          width={svgDimensions.width}
          height={svgDimensions.height}
          style={svgStyle}
          aria-hidden="true"
        >
          <path d={tooltipPath} fill="var(--rei-tooltip-bg, #1f2937)" />
        </svg>
        {/* HTML content layer */}
        <div ref={contentRef} style={contentContainerStyle}>
          {content}
        </div>
      </div>
    </>
  );
});
