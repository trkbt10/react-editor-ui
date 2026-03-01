/**
 * @file DataTableViewer toolbar component
 */

import type { CSSProperties } from "react";
import { memo, useMemo, useCallback } from "react";
import type { DataTableToolbarProps } from "./types";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { Select } from "../../components/Select/Select";
import {
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  COLOR_TEXT_MUTED,
  COLOR_BORDER,
} from "../../themes/styles";

// ============================================================================
// Static styles
// ============================================================================

const TOOLBAR_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_MD,
  padding: SPACE_SM,
  borderBottom: `1px solid ${COLOR_BORDER}`,
  flexWrap: "wrap",
};

const SEARCH_CONTAINER_STYLE: CSSProperties = {
  minWidth: 200,
  maxWidth: 300,
};

const FILTER_CONTAINER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const SPACER_STYLE: CSSProperties = {
  flex: 1,
};

const ROW_COUNT_STYLE: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT_MUTED,
  whiteSpace: "nowrap",
};

// ============================================================================
// Component
// ============================================================================

/**
 * Toolbar for DataTableViewer with search, filters, and row count
 */
export const DataTableToolbar = memo(function DataTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  onFilterChange,
  querySlot,
  rowCount,
  totalRowCount,
  showRowCount = true,
}: DataTableToolbarProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onSearchChange(value);
    },
    [onSearchChange]
  );

  const filterHandlers = useMemo(() => {
    if (!filters || !onFilterChange) {
      return {};
    }
    return Object.fromEntries(
      filters.map((f) => [
        f.key,
        (value: string) => onFilterChange(f.key, value),
      ])
    );
  }, [filters, onFilterChange]);

  const rowCountText = useMemo(() => {
    if (totalRowCount != null && totalRowCount !== rowCount) {
      return `${rowCount.toLocaleString()} of ${totalRowCount.toLocaleString()} rows`;
    }
    return `${rowCount.toLocaleString()} rows`;
  }, [rowCount, totalRowCount]);

  return (
    <div style={TOOLBAR_STYLE}>
      <div style={SEARCH_CONTAINER_STYLE}>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          size="sm"
        />
      </div>

      {filters && filters.length > 0 && (
        <div style={FILTER_CONTAINER_STYLE}>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onChange={filterHandlers[filter.key]}
              options={
                filter.options ?? [{ value: "", label: filter.label }]
              }
              size="sm"
            />
          ))}
        </div>
      )}

      {querySlot}

      <div style={SPACER_STYLE} />

      {showRowCount && <div style={ROW_COUNT_STYLE}>{rowCountText}</div>}
    </div>
  );
});
