/**
 * @file PatternFillSection component - Section for pattern fill settings
 */

import { memo, useMemo, useCallback, type CSSProperties } from "react";
import { Button } from "../../components/Button/Button";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../../components/SegmentedControl/SegmentedControl";
import { Input } from "../../components/Input/Input";
import { PropertyRow } from "../../components/PropertyRow/PropertyRow";
import { AlignmentGrid } from "../../components/AlignmentGrid/AlignmentGrid";
import type { AlignmentType } from "../../components/AlignmentGrid/types";
import {
  COLOR_BORDER,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  RADIUS_SM,
} from "../../themes/styles";
import type { PatternFillValue, TileType } from "./types";

export type PatternFillSectionProps = {
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

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V5C12 4.44772 11.5523 4 11 4H7L5.5 2H3C2.44772 2 2 2.44772 2 3V4Z" />
    </svg>
  );
}

// Static styles
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

/**
 * Pattern fill section with tiling, scale, spacing, and alignment controls.
 */
export const PatternFillSection = memo(function PatternFillSection({
  value,
  onChange,
  onSelectSource,
  disabled = false,
}: PatternFillSectionProps) {
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

  const renderPreviewContent = () => {
    if (hasSource) {
      return (
        <img
          src={value.sourceUrl}
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
  };

  return (
    <div style={containerStyle}>
      <div style={previewContainerStyle}>
        {renderPreviewContent()}
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
          aria-label="Pattern alignment"
        />
      </PropertyRow>
    </div>
  );
});
