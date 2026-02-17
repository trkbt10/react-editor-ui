/**
 * @file ThemeEditor - Editor for diagram default styles
 */

import { memo, useContext, useMemo, type CSSProperties } from "react";

import { PropertySection } from "../../../../../components/PropertySection/PropertySection";
import { PropertyRow } from "../../../../../components/PropertyRow/PropertyRow";
import { UnitInput } from "../../../../../components/UnitInput/UnitInput";
import { ColorInput } from "../../../../../components/ColorInput/ColorInput";
import { Select, type SelectOption } from "../../../../../components/Select/Select";
import type { ColorValue } from "../../../../../utils/color/types";

import { StrokeStyleSelect, type StrokeStyle as SectionStrokeStyle } from "../../../../../components/StrokeStyleSelect/StrokeStyleSelect";

import { DocumentContext } from "../contexts";
import type { StrokeStyle, ArrowheadType } from "../types";

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

// =============================================================================
// Options
// =============================================================================

const arrowheadOptions: SelectOption<ArrowheadType>[] = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Arrow" },
  { value: "triangle", label: "Triangle" },
  { value: "diamond", label: "Diamond" },
  { value: "circle", label: "Circle" },
];

const pixelUnits = [{ value: "px", label: "px" }];

// =============================================================================
// Component
// =============================================================================

export const ThemeEditor = memo(function ThemeEditor() {
  const documentCtx = useContext(DocumentContext);

  if (!documentCtx) {
    return null;
  }

  const { document, setDocument } = documentCtx;
  const { theme } = document;

  // Theme property handlers
  const handlers = useMemo(
    () => ({
      // Node defaults
      setNodeFill: (fill: ColorValue) => {
        setDocument((prev) => ({
          ...prev,
          theme: { ...prev.theme, defaultNodeFill: fill },
        }));
      },
      setNodeStrokeColor: (color: ColorValue) => {
        setDocument((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            defaultNodeStroke: { ...prev.theme.defaultNodeStroke, color },
          },
        }));
      },
      setNodeStrokeWidth: (value: string) => {
        const width = Math.max(0, parseFloat(value) || 0);
        setDocument((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            defaultNodeStroke: { ...prev.theme.defaultNodeStroke, width },
          },
        }));
      },
      setNodeStrokeStyle: (style: StrokeStyle) => {
        setDocument((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            defaultNodeStroke: { ...prev.theme.defaultNodeStroke, style },
          },
        }));
      },
      // Connection defaults
      setConnectionStrokeColor: (color: ColorValue) => {
        setDocument((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            defaultConnectionStroke: { ...prev.theme.defaultConnectionStroke, color },
          },
        }));
      },
      setConnectionStrokeWidth: (value: string) => {
        const width = Math.max(0, parseFloat(value) || 0);
        setDocument((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            defaultConnectionStroke: { ...prev.theme.defaultConnectionStroke, width },
          },
        }));
      },
      setConnectionStrokeStyle: (style: StrokeStyle) => {
        setDocument((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            defaultConnectionStroke: { ...prev.theme.defaultConnectionStroke, style },
          },
        }));
      },
      setConnectionArrow: (arrow: ArrowheadType) => {
        setDocument((prev) => ({
          ...prev,
          theme: { ...prev.theme, defaultConnectionArrow: arrow },
        }));
      },
      // Canvas
      setCanvasBackground: (color: ColorValue) => {
        setDocument((prev) => ({
          ...prev,
          theme: { ...prev.theme, canvasBackground: color },
        }));
      },
      setGridColor: (color: ColorValue) => {
        setDocument((prev) => ({
          ...prev,
          theme: { ...prev.theme, gridColor: color },
        }));
      },
    }),
    [setDocument],
  );

  return (
    <div style={containerStyle}>
      <PropertySection title="Node Defaults">
        <PropertyRow label="Fill">
          <ColorInput
            value={theme.defaultNodeFill}
            onChange={handlers.setNodeFill}
            size="sm"
            showVisibilityToggle
          />
        </PropertyRow>
        <PropertyRow label="Stroke">
          <ColorInput
            value={theme.defaultNodeStroke.color}
            onChange={handlers.setNodeStrokeColor}
            size="sm"
            showVisibilityToggle
          />
        </PropertyRow>
        <PropertyRow label="Stroke Width">
          <UnitInput
            value={String(theme.defaultNodeStroke.width)}
            onChange={handlers.setNodeStrokeWidth}
            units={pixelUnits}
            size="sm"
          />
        </PropertyRow>
        <PropertyRow label="Stroke Style">
          <StrokeStyleSelect
            value={theme.defaultNodeStroke.style as SectionStrokeStyle}
            onChange={handlers.setNodeStrokeStyle as (v: SectionStrokeStyle) => void}
            size="sm"
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Connection Defaults">
        <PropertyRow label="Stroke">
          <ColorInput
            value={theme.defaultConnectionStroke.color}
            onChange={handlers.setConnectionStrokeColor}
            size="sm"
            showVisibilityToggle
          />
        </PropertyRow>
        <PropertyRow label="Stroke Width">
          <UnitInput
            value={String(theme.defaultConnectionStroke.width)}
            onChange={handlers.setConnectionStrokeWidth}
            units={pixelUnits}
            size="sm"
          />
        </PropertyRow>
        <PropertyRow label="Stroke Style">
          <StrokeStyleSelect
            value={theme.defaultConnectionStroke.style as SectionStrokeStyle}
            onChange={handlers.setConnectionStrokeStyle as (v: SectionStrokeStyle) => void}
            size="sm"
          />
        </PropertyRow>
        <PropertyRow label="Arrow">
          <Select
            options={arrowheadOptions}
            value={theme.defaultConnectionArrow}
            onChange={handlers.setConnectionArrow}
            size="sm"
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Canvas">
        <PropertyRow label="Background">
          <ColorInput
            value={theme.canvasBackground}
            onChange={handlers.setCanvasBackground}
            size="sm"
            showVisibilityToggle
          />
        </PropertyRow>
        <PropertyRow label="Grid Color">
          <ColorInput
            value={theme.gridColor}
            onChange={handlers.setGridColor}
            size="sm"
            showVisibilityToggle
          />
        </PropertyRow>
      </PropertySection>
    </div>
  );
});
