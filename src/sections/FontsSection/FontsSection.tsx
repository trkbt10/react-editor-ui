/**
 * @file FontsSection component - Font picker with search and category filter
 */

import { memo, useMemo, useCallback, type CSSProperties } from "react";
import { Select, type SelectOption } from "../../components/Select/Select";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import {
  COLOR_SELECTED,
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
} from "../../constants/styles";
import type { FontsSectionProps, FontItem, FontCategory } from "./types";

const categoryOptions: SelectOption<FontCategory>[] = [
  { value: "all", label: "All fonts" },
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "display", label: "Display" },
  { value: "handwriting", label: "Handwriting" },
];

// Styles
const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

const listContainerStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE_RAISED,
  borderRadius: 4,
  overflow: "hidden",
};

const emptyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: SPACE_LG,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const fontItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: `${SPACE_SM} ${SPACE_MD}`,
  cursor: "pointer",
  transition: "background-color 0.1s",
};

const fontItemSelectedStyle: CSSProperties = {
  ...fontItemStyle,
  backgroundColor: COLOR_SELECTED,
};

const fontNameStyle: CSSProperties = {
  flex: 1,
  color: COLOR_TEXT,
  fontSize: SIZE_FONT_MD,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// Sub-components
type FontListItemProps = {
  font: FontItem;
  isSelected: boolean;
  onSelectFont: (fontName: string) => void;
};

const FontListItem = memo(function FontListItem({ font, isSelected, onSelectFont }: FontListItemProps) {
  const itemStyle = isSelected ? fontItemSelectedStyle : fontItemStyle;
  const nameStyle = useMemo<CSSProperties>(
    () => ({ ...fontNameStyle, fontFamily: font.family }),
    [font.family],
  );

  const handleClick = useCallback(() => {
    onSelectFont(font.name);
  }, [onSelectFont, font.name]);

  return (
    <div
      style={itemStyle}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
    >
      <span style={nameStyle}>{font.name}</span>
    </div>
  );
});

/**
 * Fonts section with search, category filter, and font list.
 */
export const FontsSection = memo(function FontsSection({
  fonts,
  data,
  onChange,
  onSelectFont,
  maxListHeight = 300,
  className,
}: FontsSectionProps) {
  const filteredFonts = useMemo(() => {
    return fonts.filter((font) => {
      const matchesSearch = font.name.toLowerCase().includes(data.searchQuery.toLowerCase());
      const matchesCategory = data.category === "all" || font.category === data.category;
      return matchesSearch && matchesCategory;
    });
  }, [fonts, data.searchQuery, data.category]);

  const handleSearchChange = useCallback(
    (value: string) => {
      onChange({ ...data, searchQuery: value });
    },
    [onChange, data],
  );

  const handleCategoryChange = useCallback(
    (value: FontCategory) => {
      onChange({ ...data, category: value });
    },
    [onChange, data],
  );

  const handleFontSelect = useCallback(
    (fontName: string) => {
      onChange({ ...data, selectedFont: fontName });
      onSelectFont(fontName);
    },
    [onChange, onSelectFont, data],
  );

  const listStyle = useMemo<CSSProperties>(
    () => ({
      ...listContainerStyle,
      maxHeight: typeof maxListHeight === "number" ? maxListHeight : maxListHeight,
      overflowY: "auto",
    }),
    [maxListHeight],
  );

  return (
    <div className={className} style={containerStyle}>
      <SearchInput
        value={data.searchQuery}
        onChange={handleSearchChange}
        placeholder="Search fonts..."
        aria-label="Search fonts"
      />

      <Select
        options={categoryOptions}
        value={data.category}
        onChange={handleCategoryChange}
        aria-label="Font category"
      />

      <div style={listStyle} role="listbox" aria-label="Fonts">
        {filteredFonts.length === 0 && <div style={emptyStyle}>No fonts found</div>}
        {filteredFonts.map((font) => (
          <FontListItem
            key={font.name}
            font={font}
            isSelected={font.name === data.selectedFont}
            onSelectFont={handleFontSelect}
          />
        ))}
      </div>
    </div>
  );
});
