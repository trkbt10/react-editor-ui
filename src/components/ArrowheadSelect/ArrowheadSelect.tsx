/**
 * @file ArrowheadSelect - Arrowhead style selector with visual icons
 */

import { memo, useMemo, type CSSProperties } from "react";
import { Select, type SelectOption } from "../Select/Select";

export type ArrowheadType = "none" | "arrow" | "triangle" | "diamond" | "circle";

export type ArrowheadSelectProps = {
  /** Current arrowhead type */
  value: ArrowheadType;
  /** Called when arrowhead type changes */
  onChange: (value: ArrowheadType) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Direction of the arrow (for visual display) */
  direction?: "start" | "end";
  /** Aria label */
  "aria-label"?: string;
};

const iconStyle: CSSProperties = {
  width: 20,
  height: 14,
  display: "inline-block",
  verticalAlign: "middle",
  marginRight: 6,
};

/**
 * SVG icon for arrowhead preview.
 */
function ArrowheadIcon({ type, direction }: { type: ArrowheadType; direction: "start" | "end" }) {
  const isStart = direction === "start";

  return (
    <svg
      style={iconStyle}
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Line */}
      <line
        x1={isStart ? 6 : 2}
        y1="7"
        x2={isStart ? 18 : 14}
        y2="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Arrowhead marker */}
      {type === "arrow" && (
        <polyline
          points={isStart ? "10,3 6,7 10,11" : "10,3 14,7 10,11"}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
      )}
      {type === "triangle" && (
        <polygon
          points={isStart ? "2,7 8,3 8,11" : "18,7 12,3 12,11"}
          fill="currentColor"
        />
      )}
      {type === "diamond" && (
        <polygon
          points={isStart ? "2,7 6,4 10,7 6,10" : "18,7 14,4 10,7 14,10"}
          fill="currentColor"
        />
      )}
      {type === "circle" && (
        <circle
          cx={isStart ? 5 : 15}
          cy="7"
          r="3"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

/**
 * Create option with preview icon.
 */
function createArrowheadOption(
  type: ArrowheadType,
  label: string,
  direction: "start" | "end",
): SelectOption<ArrowheadType> {
  return {
    value: type,
    label,
    preview: <ArrowheadIcon type={type} direction={direction} />,
  };
}

/**
 * Arrowhead style selector with visual preview icons.
 */
export const ArrowheadSelect = memo(function ArrowheadSelect({
  value,
  onChange,
  size = "md",
  direction = "end",
  "aria-label": ariaLabel = "Arrowhead style",
}: ArrowheadSelectProps) {
  const options = useMemo(
    () => [
      createArrowheadOption("none", "None", direction),
      createArrowheadOption("arrow", "Arrow", direction),
      createArrowheadOption("triangle", "Triangle", direction),
      createArrowheadOption("diamond", "Diamond", direction),
      createArrowheadOption("circle", "Circle", direction),
    ],
    [direction],
  );

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      size={size}
      aria-label={ariaLabel}
    />
  );
});
