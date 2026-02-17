/**
 * @file ExportPreview - Preview component with checkerboard background
 */

import { memo, useMemo, useId, type CSSProperties } from "react";
import { RADIUS_SM, COLOR_BORDER } from "../../themes/styles";

export type ExportPreviewProps = {
  /** SVG content to preview */
  svgContent?: string;
  /** Maximum width of preview area */
  maxWidth?: number;
  /** Maximum height of preview area */
  maxHeight?: number;
};

const CHECKER_SIZE = 8;

const containerStyle: CSSProperties = {
  position: "relative",
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  overflow: "hidden",
};

const contentStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  boxSizing: "border-box",
};

function createSvgDataUrl(svgContent: string): string {
  // Remove XML declaration if present
  const cleanSvg = svgContent.replace(/<\?xml[^?]*\?>\s*/g, "");
  return `data:image/svg+xml,${encodeURIComponent(cleanSvg)}`;
}

function renderPreviewImage(svgContent: string | undefined, style: CSSProperties) {
  if (!svgContent) {
    return null;
  }
  const src = createSvgDataUrl(svgContent);
  return <img src={src} alt="Export preview" style={style} />;
}

export const ExportPreview = memo(function ExportPreview({
  svgContent,
  maxWidth = 280,
  maxHeight = 200,
}: ExportPreviewProps) {
  const patternId = useId();

  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      ...containerStyle,
      width: "100%",
      maxWidth,
      height: maxHeight,
    }),
    [maxWidth, maxHeight],
  );

  const svgStyle = useMemo<CSSProperties>(
    () => ({
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain" as const,
      display: "block",
    }),
    [],
  );

  return (
    <div style={wrapperStyle}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={patternId}
            width={CHECKER_SIZE * 2}
            height={CHECKER_SIZE * 2}
            patternUnits="userSpaceOnUse"
          >
            <rect width={CHECKER_SIZE * 2} height={CHECKER_SIZE * 2} fill="#ffffff" />
            <rect width={CHECKER_SIZE} height={CHECKER_SIZE} fill="#e5e5e5" />
            <rect x={CHECKER_SIZE} y={CHECKER_SIZE} width={CHECKER_SIZE} height={CHECKER_SIZE} fill="#e5e5e5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div style={contentStyle}>
        {renderPreviewImage(svgContent, svgStyle)}
      </div>
    </div>
  );
});
