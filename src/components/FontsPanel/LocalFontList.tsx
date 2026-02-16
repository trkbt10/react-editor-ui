/**
 * @file LocalFontList component - Display local fonts with permission request via queryLocalFonts API
 */

import { useState, useMemo, type CSSProperties } from "react";
import { Input } from "../Input/Input";
import { IconButton } from "../IconButton/IconButton";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_PRIMARY,
  RADIUS_LG,
  SHADOW_LG,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_PANEL_HEADER_HEIGHT,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";
import { useLocalFonts, type LocalFontFamily, type LocalFontsStatus } from "./useLocalFonts";

export type LocalFontListProps = {
  /** Currently selected font family name */
  selectedFont: string;
  /** Callback when a font is selected */
  onSelectFont: (fontFamily: string, postscriptName?: string) => void;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when settings button is clicked */
  onSettings?: () => void;
  /** Panel width */
  width?: number | string;
  /** Panel max height */
  maxHeight?: number | string;
  /** Additional class name */
  className?: string;
  /** Show individual font styles (true) or just family names (false) */
  showStyles?: boolean;
};

// Icons
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

function formatDimension(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

function FontFamilyItem({
  family,
  isSelected,
  onSelect,
}: {
  family: LocalFontFamily;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_MD,
    padding: `${SPACE_SM} ${SPACE_LG}`,
    backgroundColor: isSelected ? COLOR_SELECTED : isHovered ? COLOR_HOVER : "transparent",
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  const checkboxStyle: CSSProperties = {
    width: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isSelected ? COLOR_PRIMARY : "transparent",
    flexShrink: 0,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  };

  const nameStyle: CSSProperties = {
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_MD,
    fontFamily: `"${family.family}", sans-serif`,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const stylesStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "2px",
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={itemStyle}
    >
      <span style={checkboxStyle}>
        {isSelected ? <CheckIcon /> : null}
      </span>
      <div style={contentStyle}>
        <div style={nameStyle}>{family.family}</div>
        <div style={stylesStyle}>{family.styles.join(", ")}</div>
      </div>
    </div>
  );
}

function renderPermissionRequest(
  status: LocalFontsStatus,
  error: string | null,
  isSupported: boolean,
  requestFonts: () => void,
) {
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACE_LG,
    gap: SPACE_MD,
    textAlign: "center",
    height: "200px",
  };

  const messageStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
    maxWidth: "220px",
  };

  const buttonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: SPACE_SM,
    padding: `${SPACE_SM} ${SPACE_MD}`,
    backgroundColor: COLOR_PRIMARY,
    color: "#ffffff",
    border: "none",
    borderRadius: RADIUS_LG,
    fontSize: SIZE_FONT_SM,
    fontWeight: 500,
    cursor: "pointer",
    transition: `opacity ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  const errorStyle: CSSProperties = {
    ...messageStyle,
    color: "#ef4444",
  };

  if (!isSupported) {
    return (
      <div style={containerStyle}>
        <div style={messageStyle}>
          Local Font Access API is not supported in this browser.
          Try using Chrome or Edge.
        </div>
      </div>
    );
  }

  if (status === "requesting") {
    return (
      <div style={containerStyle}>
        <div style={messageStyle}>Requesting font access...</div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          Font access permission was denied.
        </div>
        <button onClick={requestFonts} style={buttonStyle}>
          <RefreshIcon />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={messageStyle}>
        Access your system fonts for a personalized experience.
      </div>
      <button onClick={requestFonts} style={buttonStyle}>
        Load Local Fonts
      </button>
      {error ? <div style={errorStyle}>{error}</div> : null}
    </div>
  );
}

function renderFontList(
  families: readonly LocalFontFamily[],
  selectedFont: string,
  onSelectFont: (fontFamily: string) => void,
  emptyStyle: CSSProperties,
) {
  if (families.length === 0) {
    return <div style={emptyStyle}>No fonts found</div>;
  }

  return families.map((family) => (
    <FontFamilyItem
      key={family.family}
      family={family}
      isSelected={family.family === selectedFont}
      onSelect={() => onSelectFont(family.family)}
    />
  ));
}

function renderReloadButton(isLoaded: boolean, requestFonts: () => void) {
  if (!isLoaded) {
    return null;
  }
  return (
    <IconButton
      icon={<RefreshIcon />}
      aria-label="Reload fonts"
      size="sm"
      onClick={requestFonts}
    />
  );
}

function renderSettingsButton(onSettings?: () => void) {
  if (!onSettings) {
    return null;
  }
  return (
    <IconButton
      icon={<SettingsIcon />}
      aria-label="Font settings"
      size="sm"
      onClick={onSettings}
    />
  );
}

function renderCloseButton(onClose?: () => void) {
  if (!onClose) {
    return null;
  }
  return (
    <IconButton
      icon={<CloseIcon />}
      aria-label="Close"
      size="sm"
      onClick={onClose}
    />
  );
}

type ContentProps = {
  isLoaded: boolean;
  status: LocalFontsStatus;
  error: string | null;
  isSupported: boolean;
  requestFonts: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredFamilies: readonly LocalFontFamily[];
  selectedFont: string;
  onSelectFont: (fontFamily: string) => void;
  searchContainerStyle: CSSProperties;
  statusBarStyle: CSSProperties;
  listStyle: CSSProperties;
  emptyStyle: CSSProperties;
};

function renderContent(props: ContentProps) {
  if (!props.isLoaded) {
    return renderPermissionRequest(props.status, props.error, props.isSupported, props.requestFonts);
  }
  return (
    <>
      {/* Search */}
      <div style={props.searchContainerStyle}>
        <Input
          value={props.searchQuery}
          onChange={props.setSearchQuery}
          placeholder="Search fonts..."
          iconStart={<SearchIcon />}
          clearable
          aria-label="Search fonts"
        />
      </div>

      {/* Status bar */}
      <div style={props.statusBarStyle}>
        <span>{props.filteredFamilies.length} font families</span>
      </div>

      {/* Font List */}
      <div style={props.listStyle} role="listbox" aria-label="Local fonts">
        {renderFontList(props.filteredFamilies, props.selectedFont, props.onSelectFont, props.emptyStyle)}
      </div>
    </>
  );
}

/**
 * Displays local fonts using the queryLocalFonts API with permission handling
 */
export function LocalFontList({
  selectedFont,
  onSelectFont,
  onClose,
  onSettings,
  width = 280,
  maxHeight = 400,
  className,
}: LocalFontListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { status, families, requestFonts, error, isSupported } = useLocalFonts();

  const filteredFamilies = useMemo(() => {
    if (!searchQuery) {return families;}
    const query = searchQuery.toLowerCase();
    return families.filter((f) => f.family.toLowerCase().includes(query));
  }, [families, searchQuery]);

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: formatDimension(width),
    maxHeight: formatDimension(maxHeight),
    backgroundColor: COLOR_SURFACE,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    overflow: "hidden",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: SIZE_PANEL_HEADER_HEIGHT,
    padding: `0 ${SPACE_LG}`,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    boxSizing: "border-box",
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_MD,
    fontWeight: 600,
    margin: 0,
  };

  const headerActionsStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
  };

  const searchContainerStyle: CSSProperties = {
    padding: SPACE_MD,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    flexShrink: 0,
  };

  const statusBarStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${SPACE_SM} ${SPACE_MD}`,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    flexShrink: 0,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  const listStyle: CSSProperties = {
    flex: 1,
    overflowY: "auto",
    backgroundColor: COLOR_SURFACE_RAISED,
  };

  const emptyStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACE_LG,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  const isLoaded = status === "granted";

  return (
    <div className={className} style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>Local Fonts</h3>
        <div style={headerActionsStyle}>
          {renderReloadButton(isLoaded, requestFonts)}
          {renderSettingsButton(onSettings)}
          {renderCloseButton(onClose)}
        </div>
      </div>

      {/* Content based on status */}
      {renderContent({
        isLoaded,
        status,
        error,
        isSupported,
        requestFonts,
        searchQuery,
        setSearchQuery,
        filteredFamilies,
        selectedFont,
        onSelectFont,
        searchContainerStyle,
        statusBarStyle,
        listStyle,
        emptyStyle,
      })}
    </div>
  );
}
