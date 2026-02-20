/**
 * @file FontsPanel component - Font picker with search and category filter
 *
 * @description
 * A scrollable font selection panel content with search input and category tabs.
 * Displays fonts in a virtualized list with live preview using the font family.
 * Wrap with PanelFrame for floating panel UI.
 *
 * @example
 * ```tsx
 * import { FontsPanel } from "react-editor-ui/panels/FontsPanel";
 * import { PanelFrame } from "react-editor-ui/PanelFrame";
 *
 * <PanelFrame title="Fonts" onClose={() => setOpen(false)} width={280}>
 *   <FontsPanel
 *     fonts={[
 *       { name: "Inter", family: "Inter", category: "sans-serif" },
 *       { name: "Roboto", family: "Roboto", category: "sans-serif" },
 *     ]}
 *     selectedFont="Inter"
 *     onSelectFont={(font) => console.log(font)}
 *   />
 * </PanelFrame>
 * ```
 */

import { useState, memo, useCallback, useMemo } from "react";
import { FontsSection } from "../../sections/FontsSection/FontsSection";
import type { FontsData, FontCategory } from "../../sections/FontsSection/types";

export type FontsPanelProps = {
  fonts: { name: string; family: string; category?: FontCategory }[];
  selectedFont: string;
  onSelectFont: (fontName: string) => void;
  onSettings?: () => void;
  maxHeight?: number;
  className?: string;
};

/**
 * Scrollable font picker panel content with search and category filter.
 */
export const FontsPanel = memo(function FontsPanel({
  fonts,
  selectedFont,
  onSelectFont,
  onSettings,
  maxHeight = 400,
  className,
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

  // Calculate list height based on maxHeight minus controls
  const listHeight = useMemo(() => {
    // Approximate: search ~36px, category ~36px, gaps ~24px
    const overhead = 96;
    return maxHeight - overhead;
  }, [maxHeight]);

  return (
    <FontsSection
      fonts={fonts}
      data={data}
      onChange={handleChange}
      onSelectFont={handleSelectFont}
      onSettings={onSettings}
      maxListHeight={listHeight}
      className={className}
    />
  );
});
