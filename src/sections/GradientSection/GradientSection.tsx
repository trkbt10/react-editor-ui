/**
 * @file GradientSection component - Full gradient editing interface
 *
 * @description
 * A gradient editor with type selector (linear, radial, angular, diamond),
 * visual gradient bar with draggable stops, and stop list for precise color control.
 * Supports adding/removing stops and adjusting stop positions.
 *
 * @example
 * ```tsx
 * import { GradientSection } from "react-editor-ui/sections/GradientSection";
 *
 * const [gradient, setGradient] = useState({
 *   type: "linear",
 *   angle: 90,
 *   stops: [
 *     { id: "1", position: 0, color: { hex: "#3b82f6", opacity: 100, visible: true } },
 *     { id: "2", position: 100, color: { hex: "#8b5cf6", opacity: 100, visible: true } },
 *   ],
 * });
 *
 * <GradientSection value={gradient} onChange={setGradient} />
 * ```
 */

import { memo, useState, useRef, useCallback, useMemo } from "react";
import type { CSSProperties, ChangeEvent } from "react";
import {
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  FONT_WEIGHT_MEDIUM,
  RADIUS_SM,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  SPACE_XS,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";
import type { GradientValue, GradientType, GradientStop } from "../../utils/gradient/types";
import { generateStopId, sortStopsByPosition } from "../../utils/gradient/utils";
import { GradientBar } from "../../components/GradientBar/GradientBar";
import { GradientStopRow } from "../../components/GradientStopRow/GradientStopRow";
import { GradientTypeSelector } from "../../components/GradientTypeSelector/GradientTypeSelector";
import { normalizeAngle } from "../../utils/color/angleNormalization";

export type GradientSectionProps = {
  value: GradientValue;
  onChange: (value: GradientValue) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Gradient editing section with type selector, preview bar, and stop list.
 */
export const GradientSection = memo(function GradientSection({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Gradient editor",
}: GradientSectionProps) {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    value.stops[0]?.id ?? null,
  );
  const [angleInput, setAngleInput] = useState(String(value.angle));
  const [isAddButtonHovered, setIsAddButtonHovered] = useState(false);

  // Track last angle for syncing
  const lastAngleRef = useRef(value.angle);

  // Sync local state when external value changes
  if (lastAngleRef.current !== value.angle) {
    lastAngleRef.current = value.angle;
    setAngleInput(String(value.angle));
  }

  const handleTypeChange = useCallback(
    (type: GradientType) => {
      onChange({ ...value, type });
    },
    [onChange, value],
  );

  const handleAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setAngleInput(inputValue);
    const parsed = parseInt(inputValue, 10);
    if (!Number.isNaN(parsed)) {
      onChange({ ...value, angle: normalizeAngle(parsed) });
    }
  };

  const handleAngleBlur = () => {
    const parsed = parseInt(angleInput, 10);
    if (Number.isNaN(parsed)) {
      setAngleInput(String(value.angle));
    }
  };

  const handleGradientChange = useCallback(
    (newValue: GradientValue) => {
      onChange(newValue);
    },
    [onChange],
  );

  const handleStopChange = useCallback(
    (updatedStop: GradientStop) => {
      const newStops = value.stops.map((stop) => {
        if (stop.id === updatedStop.id) {
          return updatedStop;
        }
        return stop;
      });
      onChange({ ...value, stops: newStops });
    },
    [onChange, value],
  );

  const handleStopRemove = useCallback(
    (stopId: string) => {
      if (value.stops.length <= 2) {
        return; // Keep at least 2 stops
      }
      const newStops = value.stops.filter((stop) => stop.id !== stopId);
      onChange({ ...value, stops: newStops });

      // Select another stop if the removed one was selected
      if (selectedStopId === stopId) {
        setSelectedStopId(newStops[0]?.id ?? null);
      }
    },
    [onChange, selectedStopId, value],
  );

  const handleAddStop = useCallback(() => {
    // Add a new stop at 50% or find a gap
    const sortedStops = sortStopsByPosition(value.stops);

    // Find the largest gap between stops
    const gaps = sortedStops.slice(0, -1).map((stop, i) => ({
      size: sortedStops[i + 1].position - stop.position,
      start: stop.position,
    }));
    const largestGap = gaps.reduce((max, gap) => (gap.size > max.size ? gap : max), { size: 0, start: 0 });

    const computePosition = (gap: { size: number; start: number }): number =>
      gap.size > 0 ? Math.round(gap.start + gap.size / 2) : 50;
    const newPosition = computePosition(largestGap);

    const newStop: GradientStop = {
      id: generateStopId(),
      position: newPosition,
      color: { hex: "#808080", opacity: 100, visible: true },
    };

    onChange({ ...value, stops: [...value.stops, newStop] });
    setSelectedStopId(newStop.id);
  }, [onChange, value]);

  const handleAddButtonPointerEnter = useCallback(() => {
    if (!disabled) {
      setIsAddButtonHovered(true);
    }
  }, [disabled]);

  const handleAddButtonPointerLeave = useCallback(() => {
    setIsAddButtonHovered(false);
  }, []);

  const showAngleInput = value.type === "linear" || value.type === "angular";
  const sortedStops = sortStopsByPosition(value.stops);

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
    opacity: disabled ? 0.5 : 1,
  };

  const headerRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_MD,
  };

  const angleContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_XS,
  };

  const angleLabelStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  const angleInputContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 22,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    backgroundColor: COLOR_INPUT_BG,
    overflow: "hidden",
  };

  const angleInputStyle: CSSProperties = {
    width: 36,
    height: "100%",
    padding: `0 ${SPACE_XS}`,
    border: "none",
    backgroundColor: "transparent",
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    outline: "none",
    textAlign: "right" as const,
  };

  const suffixStyle: CSSProperties = {
    paddingRight: SPACE_XS,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  const stopsHeaderStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACE_SM,
  };

  const stopsLabelStyle: CSSProperties = {
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    fontWeight: FONT_WEIGHT_MEDIUM,
  };

  const addButtonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 22,
      height: 22,
      padding: 0,
      border: "none",
      backgroundColor: "transparent",
      color: isAddButtonHovered && !disabled ? COLOR_ICON_HOVER : COLOR_ICON,
      cursor: disabled ? "not-allowed" : "pointer",
      outline: "none",
      transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [disabled, isAddButtonHovered],
  );

  const stopsListStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_XS,
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={containerStyle}
    >
      <div style={headerRowStyle}>
        <GradientTypeSelector
          value={value.type}
          onChange={handleTypeChange}
          disabled={disabled}
        />

        {renderAngleInput(
          showAngleInput,
          angleInput,
          handleAngleChange,
          handleAngleBlur,
          disabled,
          angleContainerStyle,
          angleLabelStyle,
          angleInputContainerStyle,
          angleInputStyle,
          suffixStyle,
        )}
      </div>

      <GradientBar
        value={value}
        onChange={handleGradientChange}
        selectedStopId={selectedStopId}
        onSelectStop={setSelectedStopId}
        disabled={disabled}
      />

      <div style={stopsHeaderStyle}>
        <span style={stopsLabelStyle}>Stops</span>
        <button
          type="button"
          onClick={handleAddStop}
          disabled={disabled}
          aria-label="Add stop"
          style={addButtonStyle}
          onPointerEnter={handleAddButtonPointerEnter}
          onPointerLeave={handleAddButtonPointerLeave}
        >
          <PlusIcon />
        </button>
      </div>

      <div style={stopsListStyle}>
        {sortedStops.map((stop) => (
          <GradientStopRow
            key={stop.id}
            stop={stop}
            onChange={handleStopChange}
            onRemove={handleStopRemove}
            isSelected={stop.id === selectedStopId}
            onSelect={setSelectedStopId}
            removeDisabled={value.stops.length <= 2}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
});

function renderAngleInput(
  show: boolean,
  angleInput: string,
  onChange: (e: ChangeEvent<HTMLInputElement>) => void,
  onBlur: () => void,
  disabled: boolean,
  containerStyle: CSSProperties,
  labelStyle: CSSProperties,
  inputContainerStyle: CSSProperties,
  inputStyle: CSSProperties,
  suffixStyle: CSSProperties,
) {
  if (!show) {
    return null;
  }
  return (
    <div style={containerStyle}>
      <span style={labelStyle}>Angle</span>
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={angleInput}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={3}
          disabled={disabled}
          aria-label="Gradient angle"
          style={inputStyle}
        />
        <span style={suffixStyle}>°</span>
      </div>
    </div>
  );
}
