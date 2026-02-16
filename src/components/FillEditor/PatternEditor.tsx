/**
 * @file PatternEditor component - Editor for pattern fill settings
 */

import { memo, useMemo, useCallback, type CSSProperties, type PointerEvent, type KeyboardEvent } from "react";
import { Button } from "../Button/Button";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../SegmentedControl/SegmentedControl";
import { Input } from "../Input/Input";
import { PropertyRow } from "../PropertyRow/PropertyRow";
import {
  COLOR_BORDER,
  COLOR_TEXT_MUTED,
  COLOR_PRIMARY,
  COLOR_HOVER,
  COLOR_SURFACE,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";
import type { PatternFillValue, TileType, AlignmentType } from "./fillTypes";

export type PatternEditorProps = {
  value: PatternFillValue;
  onChange: (value: PatternFillValue) => void;
  onSelectSource?: () => void;
  disabled?: boolean;
};

const checkerboardBackground = `
  linear-gradient(45deg, #ccc 25%, transparent 25%),
  linear-gradient(-45deg, #ccc 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #ccc 75%),
  linear-gradient(-45deg, transparent 75%, #ccc 75%)
`;

const tileTypeOptions: SegmentedControlOption<TileType>[] = [
  { value: "grid", label: "Grid" },
  { value: "brick", label: "Brick" },
];

const alignmentOptions: AlignmentType[] = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right",
];

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V5C12 4.44772 11.5523 4 11 4H7L5.5 2H3C2.44772 2 2 2.44772 2 3V4Z" />
    </svg>
  );
}

// Static styles for AlignmentGrid
const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2px",
  width: "60px",
  height: "60px",
  padding: "2px",
  borderRadius: RADIUS_SM,
  backgroundColor: COLOR_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
};

const dotBaseStyle: CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "currentColor",
};

const dotSelectedStyle: CSSProperties = {
  ...dotBaseStyle,
  color: "#fff",
};

const dotUnselectedStyle: CSSProperties = {
  ...dotBaseStyle,
  color: COLOR_TEXT_MUTED,
};

type AlignmentCellProps = {
  alignment: AlignmentType;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (alignment: AlignmentType) => void;
};

const AlignmentCell = memo(function AlignmentCell({
  alignment,
  isSelected,
  disabled,
  onSelect,
}: AlignmentCellProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isSelected ? COLOR_PRIMARY : "transparent",
      borderRadius: "2px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      opacity: disabled ? 0.5 : 1,
    }),
    [isSelected, disabled],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(alignment);
    }
  }, [disabled, onSelect, alignment]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSelect(alignment);
      }
    },
    [disabled, onSelect, alignment],
  );

  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled || isSelected) {
        return;
      }
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    },
    [disabled, isSelected],
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      e.currentTarget.style.backgroundColor = isSelected ? COLOR_PRIMARY : "transparent";
    },
    [disabled, isSelected],
  );

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={alignment.replace("-", " ")}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={style}
    >
      <div style={isSelected ? dotSelectedStyle : dotUnselectedStyle} />
    </div>
  );
});

const AlignmentGrid = memo(function AlignmentGrid({
  value,
  onChange,
  disabled,
}: {
  value: AlignmentType;
  onChange: (value: AlignmentType) => void;
  disabled: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Pattern alignment"
      style={gridStyle}
    >
      {alignmentOptions.map((alignment) => (
        <AlignmentCell
          key={alignment}
          alignment={alignment}
          isSelected={value === alignment}
          disabled={disabled}
          onSelect={onChange}
        />
      ))}
    </div>
  );
});

function renderPreview(
  hasSource: boolean,
  sourceUrl: string,
  previewImageStyle: CSSProperties,
  placeholderStyle: CSSProperties,
  iconStyle: CSSProperties,
  textStyle: CSSProperties,
) {
  if (hasSource) {
    return (
      <img
        src={sourceUrl}
        alt="Pattern source preview"
        style={previewImageStyle}
      />
    );
  }
  return (
    <div style={placeholderStyle}>
      <div style={iconStyle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <span style={textStyle}>No pattern source</span>
    </div>
  );
}

// Static styles for PatternEditor
const previewContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "80px",
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  overflow: "hidden",
  background: checkerboardBackground,
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
};

const previewImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const placeholderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  gap: SPACE_SM,
};

const iconStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
};

const textStyle: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT_MUTED,
};

const rowStyle: CSSProperties = {
  display: "flex",
  gap: SPACE_SM,
  minWidth: 0,
};

const inputContainerStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

/** Pattern fill editor with tiling, scale, rotation, and offset controls */
export const PatternEditor = memo(function PatternEditor({
  value,
  onChange,
  onSelectSource,
  disabled = false,
}: PatternEditorProps) {
  const hasSource = Boolean(value.sourceUrl);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      opacity: disabled ? 0.5 : 1,
    }),
    [disabled],
  );

  const handleTileTypeChange = useCallback(
    (tileType: TileType | TileType[]) => {
      if (Array.isArray(tileType)) {
        return;
      }
      onChange({ ...value, tileType });
    },
    [onChange, value],
  );

  const handleScaleChange = useCallback(
    (scaleStr: string) => {
      const scale = parseInt(scaleStr, 10);
      if (!isNaN(scale) && scale >= 1 && scale <= 1000) {
        onChange({ ...value, scale });
      }
    },
    [onChange, value],
  );

  const handleSpacingXChange = useCallback(
    (spacingStr: string) => {
      const spacingX = parseInt(spacingStr, 10);
      if (!isNaN(spacingX) && spacingX >= 0) {
        onChange({ ...value, spacingX });
      }
    },
    [onChange, value],
  );

  const handleSpacingYChange = useCallback(
    (spacingStr: string) => {
      const spacingY = parseInt(spacingStr, 10);
      if (!isNaN(spacingY) && spacingY >= 0) {
        onChange({ ...value, spacingY });
      }
    },
    [onChange, value],
  );

  const handleAlignmentChange = useCallback(
    (alignment: AlignmentType) => {
      onChange({ ...value, alignment });
    },
    [onChange, value],
  );

  return (
    <div style={containerStyle}>
      <div style={previewContainerStyle}>
        {renderPreview(hasSource, value.sourceUrl, previewImageStyle, placeholderStyle, iconStyle, textStyle)}
      </div>

      <Button
        onClick={onSelectSource}
        disabled={disabled}
        variant="secondary"
        size="sm"
        iconStart={<FolderIcon />}
      >
        Select source...
      </Button>

      <PropertyRow label="Tile type">
        <SegmentedControl
          options={tileTypeOptions}
          value={value.tileType}
          onChange={handleTileTypeChange}
          size="sm"
          disabled={disabled || !hasSource}
          aria-label="Tile type"
        />
      </PropertyRow>

      <PropertyRow label="Scale">
        <div style={inputContainerStyle}>
          <Input
            value={String(value.scale)}
            onChange={handleScaleChange}
            type="number"
            suffix="%"
            size="sm"
            disabled={disabled || !hasSource}
            aria-label="Pattern scale"
          />
        </div>
      </PropertyRow>

      <PropertyRow label="Spacing">
        <div style={rowStyle}>
          <div style={inputContainerStyle}>
            <Input
              value={String(value.spacingX)}
              onChange={handleSpacingXChange}
              type="number"
              prefix="X"
              suffix="px"
              size="sm"
              disabled={disabled || !hasSource}
              aria-label="Horizontal spacing"
            />
          </div>
          <div style={inputContainerStyle}>
            <Input
              value={String(value.spacingY)}
              onChange={handleSpacingYChange}
              type="number"
              prefix="Y"
              suffix="px"
              size="sm"
              disabled={disabled || !hasSource}
              aria-label="Vertical spacing"
            />
          </div>
        </div>
      </PropertyRow>

      <PropertyRow label="Alignment">
        <AlignmentGrid
          value={value.alignment}
          onChange={handleAlignmentChange}
          disabled={disabled || !hasSource}
        />
      </PropertyRow>
    </div>
  );
});
