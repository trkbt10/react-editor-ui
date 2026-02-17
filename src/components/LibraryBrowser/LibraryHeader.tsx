/**
 * @file LibraryHeader - Search bar and navigation header
 */

import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import { SPACE_SM, SPACE_MD, COLOR_ICON } from "../../themes/styles";
import { SearchInput } from "../SearchInput/SearchInput";
import { IconButton } from "../IconButton/IconButton";
import { Breadcrumb, type BreadcrumbItem } from "../Breadcrumb/Breadcrumb";
import type { LibraryHeaderProps } from "./types";

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_MD,
  padding: SPACE_MD,
};

const searchRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const searchInputWrapperStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const navigationRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const FilterIcon = memo(function FilterIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
});

const BackIcon = memo(function BackIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
});

export const LibraryHeader = memo(function LibraryHeader({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  showFilterButton,
  onFilterClick,
  navigationPath,
  onNavigateBack,
  onNavigateTo,
}: LibraryHeaderProps) {
  const showNavigation = navigationPath.length > 0;

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => navigationPath.map((entry) => ({ label: entry.label })),
    [navigationPath],
  );

  return (
    <div style={containerStyle}>
      <div style={searchRowStyle}>
        <div style={searchInputWrapperStyle}>
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            size="sm"
          />
        </div>
        {showFilterButton && (
          <IconButton
            icon={<FilterIcon />}
            aria-label="Filter"
            size="sm"
            variant="ghost"
            onClick={onFilterClick}
          />
        )}
      </div>
      {showNavigation && (
        <div style={navigationRowStyle}>
          <IconButton
            icon={<BackIcon />}
            aria-label="Go back"
            size="sm"
            variant="ghost"
            onClick={onNavigateBack}
          />
          <Breadcrumb
            items={breadcrumbItems}
            size="sm"
            onItemClick={onNavigateTo}
            separator={<span style={{ color: COLOR_ICON }}>/</span>}
          />
        </div>
      )}
    </div>
  );
});
