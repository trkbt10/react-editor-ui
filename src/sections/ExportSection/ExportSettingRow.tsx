/**
 * @file ExportSettingRow - Individual export setting row with scale and format
 */

import { memo, type CSSProperties } from "react";
import { EllipsisIcon, MinusIcon } from "../../icons";
import { Select, type SelectOption } from "../../components/Select/Select";
import { IconButton } from "../../components/IconButton/IconButton";
import { SPACE_XS, SPACE_SM } from "../../themes/styles";
import type { ExportScale, ExportFormat, ExportSetting } from "./types";

export type ExportSettingRowProps = {
  setting: ExportSetting;
  onScaleChange: (scale: ExportScale) => void;
  onFormatChange: (format: ExportFormat) => void;
  onRemove: () => void;
  canRemove: boolean;
};

const scaleOptions: SelectOption<ExportScale>[] = [
  { value: "0.5x", label: "0.5x" },
  { value: "1x", label: "1x" },
  { value: "2x", label: "2x" },
  { value: "3x", label: "3x" },
  { value: "4x", label: "4x" },
];

const formatOptions: SelectOption<ExportFormat>[] = [
  { value: "PNG", label: "PNG" },
  { value: "JPG", label: "JPG" },
  { value: "SVG", label: "SVG" },
  { value: "PDF", label: "PDF" },
  { value: "WEBP", label: "WEBP" },
];

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
  paddingBottom: SPACE_XS,
};

const selectContainerStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_XS,
  flexShrink: 0,
};

export const ExportSettingRow = memo(function ExportSettingRow({
  setting,
  onScaleChange,
  onFormatChange,
  onRemove,
  canRemove,
}: ExportSettingRowProps) {
  return (
    <div style={rowStyle}>
      <div style={selectContainerStyle}>
        <Select
          options={scaleOptions}
          value={setting.scale}
          onChange={onScaleChange}
          size="sm"
        />
      </div>
      <div style={selectContainerStyle}>
        <Select
          options={formatOptions}
          value={setting.format}
          onChange={onFormatChange}
          size="sm"
        />
      </div>
      <div style={actionsStyle}>
        <IconButton
          icon={<EllipsisIcon size="md" />}
          aria-label="More options"
          size="sm"
          variant="ghost"
        />
        <IconButton
          icon={<MinusIcon size="md" />}
          aria-label="Remove export setting"
          size="sm"
          variant="ghost"
          onClick={onRemove}
          disabled={!canRemove}
        />
      </div>
    </div>
  );
});
