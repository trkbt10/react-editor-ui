/**
 * @file FontsSection types
 */

import type { BaseSectionProps } from "../shared/types";

export type FontCategory = "all" | "serif" | "sans-serif" | "monospace" | "display" | "handwriting";

export type FontItem = {
  name: string;
  family: string;
  category?: FontCategory;
};

export type FontsData = {
  selectedFont: string;
  searchQuery: string;
  category: FontCategory;
};

export type FontsSectionProps = BaseSectionProps & {
  /** Available fonts to display */
  fonts: FontItem[];
  /** Currently selected font data */
  data: FontsData;
  /** Called when font selection or filter changes */
  onChange: (data: FontsData) => void;
  /** Called when a font is selected */
  onSelectFont: (fontName: string) => void;
  /** Called to open settings */
  onSettings?: () => void;
  /** Maximum height for the font list */
  maxListHeight?: number | string;
};
