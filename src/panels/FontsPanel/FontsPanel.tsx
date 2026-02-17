/**
 * @file FontsPanel component - Floating font picker panel with search and category filter
 */

import { useState, memo, useCallback, useMemo } from "react";
import { Panel } from "../Panel/Panel";
import { FontsSection } from "../../sections/FontsSection/FontsSection";
import type { FontsData, FontCategory } from "../../sections/FontsSection/types";

export type FontsPanelProps = {
  fonts: { name: string; family: string; category?: FontCategory }[];
  selectedFont: string;
  onSelectFont: (fontName: string) => void;
  onClose?: () => void;
  onSettings?: () => void;
  width?: number | string;
  maxHeight?: number;
};

/**
 * Scrollable font picker panel with search and category filter.
 */
export const FontsPanel = memo(function FontsPanel({
  fonts,
  selectedFont,
  onSelectFont,
  onClose,
  onSettings,
  width = 280,
  maxHeight = 400,
}: FontsPanelProps) {
  const [data, setData] = useState<FontsData>({
    selectedFont,
    searchQuery: "",
    category: "all",
  });

  const handleChange = useCallback((newData: FontsData) => {
    setData(newData);
  }, []);

  const handleSelectFont = useCallback(
    (fontName: string) => {
      onSelectFont(fontName);
    },
    [onSelectFont],
  );

  // Calculate list height based on maxHeight minus panel header and controls
  const listHeight = useMemo(() => {
    // Approximate: header ~40px, search ~36px, category ~36px, gaps ~24px
    const overhead = 136;
    return maxHeight - overhead;
  }, [maxHeight]);

  return (
    <Panel
      title="Fonts"
      onClose={onClose}
      width={width}
    >
      <FontsSection
        fonts={fonts}
        data={data}
        onChange={handleChange}
        onSelectFont={handleSelectFont}
        onSettings={onSettings}
        maxListHeight={listHeight}
      />
    </Panel>
  );
});
