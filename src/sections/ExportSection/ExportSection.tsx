/**
 * @file ExportSection - Export settings section with preview
 *
 * @description
 * A section for configuring export settings including scale and format options.
 * Features collapsible preview with checkerboard transparency background.
 *
 * @example
 * ```tsx
 * import { ExportSection } from "react-editor-ui/sections/ExportSection";
 *
 * <ExportSection
 *   data={exportData}
 *   onChange={setExportData}
 *   svgContent={previewSvg}
 *   selectionCount={3}
 *   selectionLabel="Layer"
 *   onExport={handleExport}
 * />
 * ```
 */

import { memo, useMemo, useCallback, useState, type CSSProperties } from "react";
import { LuPlus } from "react-icons/lu";
import { PropertySection } from "../../components/PropertySection/PropertySection";
import { SectionHeader } from "../../components/SectionHeader/SectionHeader";
import { IconButton } from "../../components/IconButton/IconButton";
import { Button } from "../../components/Button/Button";
import { ExportSettingRow } from "./ExportSettingRow";
import { ExportPreview } from "./ExportPreview";
import { SPACE_SM, SPACE_MD } from "../../themes/styles";
import type { ExportSectionData, ExportSetting, ExportScale, ExportFormat } from "./types";

export type ExportSectionProps = {
  /** Export settings data */
  data: ExportSectionData;
  /** Callback when data changes */
  onChange: (data: ExportSectionData) => void;
  /** SVG content for preview */
  svgContent?: string;
  /** Number of items being exported */
  selectionCount?: number;
  /** Label for selection (e.g., "Layer", "Frame") */
  selectionLabel?: string;
  /** Callback when export button is clicked */
  onExport?: () => void;
  /** Whether preview section is initially expanded */
  previewExpanded?: boolean;
};

const settingsContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

const exportButtonWrapperStyle: CSSProperties = {
  padding: `${SPACE_SM} ${SPACE_MD}`,
};

const previewContentStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: SPACE_SM,
};

const idCounter = { value: 1 };
function generateId(): string {
  const id = idCounter.value;
  idCounter.value += 1;
  return `export-${id}`;
}

export const ExportSection = memo(function ExportSection({
  data,
  onChange,
  svgContent,
  selectionCount = 1,
  selectionLabel = "Layer",
  onExport,
  previewExpanded = true,
}: ExportSectionProps) {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(previewExpanded);

  const handleAddSetting = useCallback(() => {
    const newSetting: ExportSetting = {
      id: generateId(),
      scale: "1x",
      format: "PNG",
    };
    onChange({
      ...data,
      settings: [...data.settings, newSetting],
    });
  }, [data, onChange]);

  const handlers = useMemo(() => {
    const createScaleHandler = (id: string) => (scale: ExportScale) => {
      onChange({
        ...data,
        settings: data.settings.map((s) =>
          s.id === id ? { ...s, scale } : s,
        ),
      });
    };

    const createFormatHandler = (id: string) => (format: ExportFormat) => {
      onChange({
        ...data,
        settings: data.settings.map((s) =>
          s.id === id ? { ...s, format } : s,
        ),
      });
    };

    const createRemoveHandler = (id: string) => () => {
      onChange({
        ...data,
        settings: data.settings.filter((s) => s.id !== id),
      });
    };

    return data.settings.map((setting) => ({
      id: setting.id,
      onScaleChange: createScaleHandler(setting.id),
      onFormatChange: createFormatHandler(setting.id),
      onRemove: createRemoveHandler(setting.id),
    }));
  }, [data, onChange]);

  const handlePreviewToggle = useCallback((expanded: boolean) => {
    setIsPreviewExpanded(expanded);
  }, []);

  const canRemove = data.settings.length > 1;

  const exportButtonLabel = useMemo(() => {
    if (selectionCount <= 1) {
      return `Export ${selectionLabel}`;
    }
    return `Export ${selectionCount} ${selectionLabel}${selectionCount > 1 ? "s" : ""}`;
  }, [selectionCount, selectionLabel]);

  const addButton = useMemo(
    () => (
      <IconButton
        icon={<LuPlus size={14} />}
        aria-label="Add export setting"
        size="sm"
        variant="ghost"
        onClick={handleAddSetting}
      />
    ),
    [handleAddSetting],
  );

  return (
    <div>
      <SectionHeader title="Export" action={addButton} />

      <div style={settingsContainerStyle}>
        <div style={{ padding: `0 ${SPACE_MD}` }}>
          {data.settings.map((setting, index) => {
            const handler = handlers[index];
            return (
              <ExportSettingRow
                key={setting.id}
                setting={setting}
                onScaleChange={handler.onScaleChange}
                onFormatChange={handler.onFormatChange}
                onRemove={handler.onRemove}
                canRemove={canRemove}
              />
            );
          })}
        </div>
      </div>

      <div style={exportButtonWrapperStyle}>
        <Button variant="secondary" size="sm" onClick={onExport}>
          {exportButtonLabel}
        </Button>
      </div>

      <PropertySection
        title="Preview"
        collapsible
        expanded={isPreviewExpanded}
        onToggle={handlePreviewToggle}
        contentPadding="sm"
      >
        <div style={previewContentStyle}>
          <ExportPreview svgContent={svgContent} />
        </div>
      </PropertySection>
    </div>
  );
});

export { ExportSettingRow } from "./ExportSettingRow";
export { ExportPreview } from "./ExportPreview";
export type { ExportSectionData, ExportSetting, ExportScale, ExportFormat } from "./types";
