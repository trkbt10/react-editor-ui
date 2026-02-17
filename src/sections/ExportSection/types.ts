/**
 * @file ExportSection types
 */

export type ExportScale = "0.5x" | "1x" | "2x" | "3x" | "4x";

export type ExportFormat = "PNG" | "JPG" | "SVG" | "PDF" | "WEBP";

export type ExportSetting = {
  id: string;
  scale: ExportScale;
  format: ExportFormat;
};

export type ExportSectionData = {
  settings: ExportSetting[];
};
