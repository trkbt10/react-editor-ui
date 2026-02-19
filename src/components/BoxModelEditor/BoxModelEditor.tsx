/**
 * @file BoxModelEditor component - Visual box model editor for margin, padding, and border-radius
 *
 * @description
 * Interactive visual editor for CSS box model properties.
 * Displays nested boxes for margin (outer), border (middle), and padding (inner),
 * with corner radius controls and editable spacing values.
 *
 * @example
 * ```tsx
 * import { BoxModelEditor } from "react-editor-ui/BoxModelEditor";
 * import { useState } from "react";
 *
 * const [data, setData] = useState({
 *   margin: { top: 16, right: 16, bottom: 16, left: 16 },
 *   padding: { top: 16, right: 8, bottom: 16, left: 8 },
 *   borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
 *   contentSize: { width: 344, height: 100 },
 * });
 *
 * <BoxModelEditor value={data} onChange={setData} />
 * ```
 */

import { memo, useCallback, useRef, useMemo } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent } from "react";
import {
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE_RAISED,
  COLOR_SELECTED_SUBTLE,
  SIZE_FONT_XS,
  RADIUS_MD,
  RADIUS_SM,
} from "../../themes/styles";
import type { BoxModelData } from "./types";

export type { BoxModelData, BoxSpacing, BoxCornerRadius } from "./types";

export type BoxModelEditorProps = {
  value: BoxModelData;
  onChange: (value: BoxModelData) => void;
  /** Show margin layer (default: true) */
  showMargin?: boolean;
  /** Show border-radius controls (default: true) */
  showRadius?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

type CallbackState = {
  value: BoxModelData;
  onChange: (value: BoxModelData) => void;
};

type SpacingInputProps = {
  value: number | null;
  onChange: (value: number) => void;
  position: "top" | "right" | "bottom" | "left";
  disabled: boolean;
  ariaLabel: string;
};

const inputBaseStyle: CSSProperties = {
  width: 28,
  height: 18,
  border: "none",
  background: "transparent",
  textAlign: "center",
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT,
  padding: 0,
  outline: "none",
  fontFamily: "inherit",
};

const SpacingInput = memo(function SpacingInput({
  value,
  onChange,
  position,
  disabled,
  ariaLabel,
}: SpacingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.currentTarget.value);
      if (!isNaN(parsed)) {
        onChange(Math.max(0, parsed));
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  const positionStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {
      ...inputBaseStyle,
      position: "absolute",
    };
    switch (position) {
      case "top":
        return { ...base, top: 2, left: "50%", transform: "translateX(-50%)" };
      case "bottom":
        return { ...base, bottom: 2, left: "50%", transform: "translateX(-50%)" };
      case "left":
        return { ...base, left: 2, top: "50%", transform: "translateY(-50%)" };
      case "right":
        return { ...base, right: 2, top: "50%", transform: "translateY(-50%)" };
    }
  }, [position]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value === null ? "-" : value}
      key={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      style={positionStyle}
    />
  );
});

type CornerRadiusInputProps = {
  value: number;
  onChange: (value: number) => void;
  corner: "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
  disabled: boolean;
};

const CornerRadiusInput = memo(function CornerRadiusInput({
  value,
  onChange,
  corner,
  disabled,
}: CornerRadiusInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.currentTarget.value);
      if (!isNaN(parsed)) {
        onChange(Math.max(0, parsed));
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  const positionStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {
      ...inputBaseStyle,
      position: "absolute",
      color: COLOR_TEXT_MUTED,
    };
    switch (corner) {
      case "topLeft":
        return { ...base, top: 4, left: 4 };
      case "topRight":
        return { ...base, top: 4, right: 4 };
      case "bottomRight":
        return { ...base, bottom: 4, right: 4 };
      case "bottomLeft":
        return { ...base, bottom: 4, left: 4 };
    }
  }, [corner]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      key={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={`Border radius ${corner}`}
      style={positionStyle}
    />
  );
});

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  minWidth: 280,
  aspectRatio: "1.6 / 1",
};

const marginBoxStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundColor: COLOR_SURFACE_RAISED,
  borderRadius: RADIUS_MD,
  border: `1px solid ${COLOR_BORDER}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const borderBoxStyle: CSSProperties = {
  position: "relative",
  width: "75%",
  height: "70%",
  backgroundColor: COLOR_SELECTED_SUBTLE,
  borderRadius: RADIUS_SM,
  border: `1px dashed ${COLOR_BORDER}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const contentBoxStyle: CSSProperties = {
  position: "relative",
  width: "80%",
  height: "60%",
  border: `1px dashed ${COLOR_BORDER}`,
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLOR_TEXT,
  fontSize: SIZE_FONT_XS,
};

const labelStyle: CSSProperties = {
  position: "absolute",
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  pointerEvents: "none",
};

/**
 * Visual box model editor for margin, padding, and border-radius.
 */
export const BoxModelEditor = memo(function BoxModelEditor({
  value,
  onChange,
  showMargin = true,
  showRadius = true,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: BoxModelEditorProps) {
  const stateRef = useRef<CallbackState>({ value, onChange });
  stateRef.current = { value, onChange };

  // Margin handlers
  const handleMarginTopChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, margin: { ...curr.margin, top: v } });
  }, []);
  const handleMarginRightChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, margin: { ...curr.margin, right: v } });
  }, []);
  const handleMarginBottomChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, margin: { ...curr.margin, bottom: v } });
  }, []);
  const handleMarginLeftChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, margin: { ...curr.margin, left: v } });
  }, []);

  // Padding handlers
  const handlePaddingTopChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, padding: { ...curr.padding, top: v } });
  }, []);
  const handlePaddingRightChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, padding: { ...curr.padding, right: v } });
  }, []);
  const handlePaddingBottomChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, padding: { ...curr.padding, bottom: v } });
  }, []);
  const handlePaddingLeftChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, padding: { ...curr.padding, left: v } });
  }, []);

  // Border radius handlers
  const handleRadiusTLChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, borderRadius: { ...curr.borderRadius, topLeft: v } });
  }, []);
  const handleRadiusTRChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, borderRadius: { ...curr.borderRadius, topRight: v } });
  }, []);
  const handleRadiusBRChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, borderRadius: { ...curr.borderRadius, bottomRight: v } });
  }, []);
  const handleRadiusBLChange = useCallback((v: number) => {
    const { value: curr, onChange: cb } = stateRef.current;
    cb({ ...curr, borderRadius: { ...curr.borderRadius, bottomLeft: v } });
  }, []);

  const contentSizeText = useMemo(() => {
    if (!value.contentSize) {
      return "";
    }
    return `${value.contentSize.width}×${value.contentSize.height}`;
  }, [value.contentSize]);

  return (
    <div
      className={className}
      style={containerStyle}
      role="group"
      aria-label={ariaLabel ?? "Box model editor"}
    >
      {/* Margin layer (outer) */}
      <div style={marginBoxStyle}>
        {/* Corner radius inputs */}
        {showRadius && (
          <>
            <CornerRadiusInput
              value={value.borderRadius.topLeft}
              onChange={handleRadiusTLChange}
              corner="topLeft"
              disabled={disabled}
            />
            <CornerRadiusInput
              value={value.borderRadius.topRight}
              onChange={handleRadiusTRChange}
              corner="topRight"
              disabled={disabled}
            />
            <CornerRadiusInput
              value={value.borderRadius.bottomRight}
              onChange={handleRadiusBRChange}
              corner="bottomRight"
              disabled={disabled}
            />
            <CornerRadiusInput
              value={value.borderRadius.bottomLeft}
              onChange={handleRadiusBLChange}
              corner="bottomLeft"
              disabled={disabled}
            />
          </>
        )}

        {/* Margin spacing inputs */}
        {showMargin && (
          <>
            <SpacingInput
              value={value.margin.top}
              onChange={handleMarginTopChange}
              position="top"
              disabled={disabled}
              ariaLabel="Margin top"
            />
            <SpacingInput
              value={value.margin.right}
              onChange={handleMarginRightChange}
              position="right"
              disabled={disabled}
              ariaLabel="Margin right"
            />
            <SpacingInput
              value={value.margin.bottom}
              onChange={handleMarginBottomChange}
              position="bottom"
              disabled={disabled}
              ariaLabel="Margin bottom"
            />
            <SpacingInput
              value={value.margin.left}
              onChange={handleMarginLeftChange}
              position="left"
              disabled={disabled}
              ariaLabel="Margin left"
            />
          </>
        )}

        {/* Border label */}
        <span style={{ ...labelStyle, top: 24, left: 36 }}>Border</span>

        {/* Border layer (middle) */}
        <div style={borderBoxStyle}>
          {/* Padding label */}
          <span style={{ ...labelStyle, top: 4, left: 8 }}>Padding</span>

          {/* Padding spacing inputs */}
          <SpacingInput
            value={value.padding.top}
            onChange={handlePaddingTopChange}
            position="top"
            disabled={disabled}
            ariaLabel="Padding top"
          />
          <SpacingInput
            value={value.padding.right}
            onChange={handlePaddingRightChange}
            position="right"
            disabled={disabled}
            ariaLabel="Padding right"
          />
          <SpacingInput
            value={value.padding.bottom}
            onChange={handlePaddingBottomChange}
            position="bottom"
            disabled={disabled}
            ariaLabel="Padding bottom"
          />
          <SpacingInput
            value={value.padding.left}
            onChange={handlePaddingLeftChange}
            position="left"
            disabled={disabled}
            ariaLabel="Padding left"
          />

          {/* Content area */}
          <div style={contentBoxStyle}>
            {contentSizeText && <span>{contentSizeText}</span>}
          </div>
        </div>
      </div>
    </div>
  );
});
