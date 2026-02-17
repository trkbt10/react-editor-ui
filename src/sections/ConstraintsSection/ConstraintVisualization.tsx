/**
 * @file ConstraintVisualization component - Interactive visual representation of constraint settings
 */

import { memo, useCallback } from "react";
import type { CSSProperties } from "react";
import { COLOR_PRIMARY, COLOR_BORDER, COLOR_HOVER } from "../../themes/styles";
import type { HorizontalConstraint, VerticalConstraint } from "./types";

export type ConstraintVisualizationProps = {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
  onHorizontalChange?: (value: HorizontalConstraint) => void;
  onVerticalChange?: (value: VerticalConstraint) => void;
  className?: string;
};

type ConstraintLineProps = {
  isActive: boolean;
  style: CSSProperties;
  onClick?: () => void;
  ariaLabel: string;
};

function ConstraintLine({ isActive, style, onClick, ariaLabel }: ConstraintLineProps) {
  const isInteractive = onClick !== undefined;

  const lineStyle: CSSProperties = {
    ...style,
    backgroundColor: isActive ? COLOR_PRIMARY : COLOR_BORDER,
    cursor: isInteractive ? "pointer" : "default",
    border: "none",
    padding: 0,
    transition: "background-color 0.15s ease",
  };

  if (isInteractive) {
    return (
      <button
        type="button"
        style={lineStyle}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        onPointerEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = COLOR_HOVER;
          }
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.backgroundColor = isActive ? COLOR_PRIMARY : COLOR_BORDER;
        }}
      />
    );
  }

  return <div style={lineStyle} />;
}

/**
 * Interactive visual representation of constraint settings.
 */
export const ConstraintVisualization = memo(function ConstraintVisualization({
  horizontal,
  vertical,
  onHorizontalChange,
  onVerticalChange,
  className,
}: ConstraintVisualizationProps) {
  const boxSize = 24;
  const padding = 8;

  const containerStyle: CSSProperties = {
    width: 100,
    height: 80,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: "4px",
    backgroundColor: "transparent",
  };

  const innerBoxStyle: CSSProperties = {
    width: boxSize,
    height: boxSize,
    border: `1px dashed ${COLOR_BORDER}`,
    borderRadius: "2px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const crossStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
  };

  const lineBaseStyle: CSSProperties = {
    position: "absolute",
    backgroundColor: COLOR_BORDER,
  };

  const isLeftActive = horizontal === "left" || horizontal === "left-right";
  const isRightActive = horizontal === "right" || horizontal === "left-right";
  const isTopActive = vertical === "top" || vertical === "top-bottom";
  const isBottomActive = vertical === "bottom" || vertical === "top-bottom";
  const isCenterH = horizontal === "center";
  const isCenterV = vertical === "center";
  const isScaleH = horizontal === "scale";
  const isScaleV = vertical === "scale";

  // Toggle horizontal constraint when clicking left/right lines
  const handleLeftClick = useCallback(() => {
    if (!onHorizontalChange) {
      return;
    }
    if (horizontal === "left") {
      onHorizontalChange("center");
    } else if (horizontal === "left-right") {
      onHorizontalChange("right");
    } else {
      onHorizontalChange(horizontal === "right" ? "left-right" : "left");
    }
  }, [horizontal, onHorizontalChange]);

  const handleRightClick = useCallback(() => {
    if (!onHorizontalChange) {
      return;
    }
    if (horizontal === "right") {
      onHorizontalChange("center");
    } else if (horizontal === "left-right") {
      onHorizontalChange("left");
    } else {
      onHorizontalChange(horizontal === "left" ? "left-right" : "right");
    }
  }, [horizontal, onHorizontalChange]);

  const handleTopClick = useCallback(() => {
    if (!onVerticalChange) {
      return;
    }
    if (vertical === "top") {
      onVerticalChange("center");
    } else if (vertical === "top-bottom") {
      onVerticalChange("bottom");
    } else {
      onVerticalChange(vertical === "bottom" ? "top-bottom" : "top");
    }
  }, [vertical, onVerticalChange]);

  const handleBottomClick = useCallback(() => {
    if (!onVerticalChange) {
      return;
    }
    if (vertical === "bottom") {
      onVerticalChange("center");
    } else if (vertical === "top-bottom") {
      onVerticalChange("top");
    } else {
      onVerticalChange(vertical === "top" ? "top-bottom" : "bottom");
    }
  }, [vertical, onVerticalChange]);

  // Toggle center/scale when clicking center lines
  const handleCenterHClick = useCallback(() => {
    if (!onHorizontalChange) {
      return;
    }
    if (horizontal === "center") {
      onHorizontalChange("scale");
    } else if (horizontal === "scale") {
      onHorizontalChange("left");
    } else {
      onHorizontalChange("center");
    }
  }, [horizontal, onHorizontalChange]);

  const handleCenterVClick = useCallback(() => {
    if (!onVerticalChange) {
      return;
    }
    if (vertical === "center") {
      onVerticalChange("scale");
    } else if (vertical === "scale") {
      onVerticalChange("top");
    } else {
      onVerticalChange("center");
    }
  }, [vertical, onVerticalChange]);

  return (
    <div className={className} style={containerStyle}>
      {/* Left line */}
      <ConstraintLine
        isActive={isLeftActive}
        style={{
          ...lineBaseStyle,
          left: 4,
          top: "50%",
          width: padding + 4,
          height: 2,
          transform: "translateY(-50%)",
        }}
        onClick={onHorizontalChange ? handleLeftClick : undefined}
        ariaLabel="Toggle left constraint"
      />
      {/* Right line */}
      <ConstraintLine
        isActive={isRightActive}
        style={{
          ...lineBaseStyle,
          right: 4,
          top: "50%",
          width: padding + 4,
          height: 2,
          transform: "translateY(-50%)",
        }}
        onClick={onHorizontalChange ? handleRightClick : undefined}
        ariaLabel="Toggle right constraint"
      />
      {/* Top line */}
      <ConstraintLine
        isActive={isTopActive}
        style={{
          ...lineBaseStyle,
          top: 4,
          left: "50%",
          width: 2,
          height: padding + 4,
          transform: "translateX(-50%)",
        }}
        onClick={onVerticalChange ? handleTopClick : undefined}
        ariaLabel="Toggle top constraint"
      />
      {/* Bottom line */}
      <ConstraintLine
        isActive={isBottomActive}
        style={{
          ...lineBaseStyle,
          bottom: 4,
          left: "50%",
          width: 2,
          height: padding + 4,
          transform: "translateX(-50%)",
        }}
        onClick={onVerticalChange ? handleBottomClick : undefined}
        ariaLabel="Toggle bottom constraint"
      />
      {/* Inner box */}
      <div style={innerBoxStyle}>
        <div style={crossStyle}>
          {/* Horizontal center line - clickable for center/scale toggle */}
          <ConstraintLine
            isActive={isCenterH || isScaleH}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: isCenterH ? 2 : isScaleH ? 3 : 1,
              transform: "translateY(-50%)",
            }}
            onClick={onHorizontalChange ? handleCenterHClick : undefined}
            ariaLabel="Toggle horizontal center/scale constraint"
          />
          {/* Vertical center line - clickable for center/scale toggle */}
          <ConstraintLine
            isActive={isCenterV || isScaleV}
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: isCenterV ? 2 : isScaleV ? 3 : 1,
              transform: "translateX(-50%)",
            }}
            onClick={onVerticalChange ? handleCenterVClick : undefined}
            ariaLabel="Toggle vertical center/scale constraint"
          />
          {/* Center dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 4,
              height: 4,
              backgroundColor: COLOR_PRIMARY,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          {/* Scale indicator arrows for horizontal */}
          {isScaleH && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderTop: "3px solid transparent",
                  borderBottom: "3px solid transparent",
                  borderRight: `4px solid ${COLOR_PRIMARY}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderTop: "3px solid transparent",
                  borderBottom: "3px solid transparent",
                  borderLeft: `4px solid ${COLOR_PRIMARY}`,
                }}
              />
            </>
          )}
          {/* Scale indicator arrows for vertical */}
          {isScaleV && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "3px solid transparent",
                  borderRight: "3px solid transparent",
                  borderBottom: `4px solid ${COLOR_PRIMARY}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "3px solid transparent",
                  borderRight: "3px solid transparent",
                  borderTop: `4px solid ${COLOR_PRIMARY}`,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
});
