/**
 * @file ConstraintVisualization component - Visual representation of constraint settings
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { COLOR_PRIMARY, COLOR_BORDER } from "../../constants/styles";
import type { HorizontalConstraint, VerticalConstraint } from "./positionTypes";

export type ConstraintVisualizationProps = {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
  className?: string;
};

function getLineStyle(isActive: boolean, baseStyle: CSSProperties): CSSProperties {
  return {
    ...baseStyle,
    backgroundColor: isActive ? COLOR_PRIMARY : COLOR_BORDER,
  };
}

export const ConstraintVisualization = memo(function ConstraintVisualization({
  horizontal,
  vertical,
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

  return (
    <div className={className} style={containerStyle}>
      {/* Left line */}
      <div
        style={getLineStyle(isLeftActive, {
          ...lineBaseStyle,
          left: 4,
          top: "50%",
          width: padding + 4,
          height: 2,
          transform: "translateY(-50%)",
        })}
      />
      {/* Right line */}
      <div
        style={getLineStyle(isRightActive, {
          ...lineBaseStyle,
          right: 4,
          top: "50%",
          width: padding + 4,
          height: 2,
          transform: "translateY(-50%)",
        })}
      />
      {/* Top line */}
      <div
        style={getLineStyle(isTopActive, {
          ...lineBaseStyle,
          top: 4,
          left: "50%",
          width: 2,
          height: padding + 4,
          transform: "translateX(-50%)",
        })}
      />
      {/* Bottom line */}
      <div
        style={getLineStyle(isBottomActive, {
          ...lineBaseStyle,
          bottom: 4,
          left: "50%",
          width: 2,
          height: padding + 4,
          transform: "translateX(-50%)",
        })}
      />
      {/* Inner box */}
      <div style={innerBoxStyle}>
        <div style={crossStyle}>
          {/* Horizontal center line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: isCenterH ? COLOR_PRIMARY : COLOR_BORDER,
              transform: "translateY(-50%)",
            }}
          />
          {/* Vertical center line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: isCenterV ? COLOR_PRIMARY : COLOR_BORDER,
              transform: "translateX(-50%)",
            }}
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
        </div>
      </div>
    </div>
  );
});
