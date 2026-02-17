/**
 * @file LocalFontList component - Display local fonts with permission request via queryLocalFonts API
 */

import { useState, useMemo, useCallback, memo, type CSSProperties } from "react";
import { RefreshIcon } from "../../icons";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_PRIMARY,
  RADIUS_LG,
  SHADOW_LG,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";
import { useLocalFonts, type LocalFontFamily, type LocalFontsStatus } from "./useLocalFonts";
import { FontPanelHeader } from "./FontPanelHeader";
import { FontSearchInput } from "./FontSearchInput";
import { FontListItemBase } from "./FontListItemBase";

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
  /** Show individual font styles (true) or just family names (false) */
  showStyles?: boolean;
};

function formatDimension(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

// ============================================================================
// Styles
// ============================================================================

function createContainerStyle(width: number | string, maxHeight: number | string): CSSProperties {
  return {
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
}

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

const fontNameStyle: CSSProperties = {
  color: COLOR_TEXT,
  fontSize: SIZE_FONT_MD,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const fontContentStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
};

const fontStylesTextStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginTop: "2px",
};

const permissionContainerStyle: CSSProperties = {
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

const errorMessageStyle: CSSProperties = {
  ...messageStyle,
  color: "#ef4444",
};

// ============================================================================
// Font List Item
// ============================================================================

type FontFamilyItemProps = {
  family: LocalFontFamily;
  isSelected: boolean;
  onSelectFont: (fontFamily: string) => void;
};

const FontFamilyItem = memo(function FontFamilyItem({
  family,
  isSelected,
  onSelectFont,
}: FontFamilyItemProps) {
  const handleSelect = useCallback(() => {
    onSelectFont(family.family);
  }, [onSelectFont, family.family]);

  return (
    <FontListItemBase isSelected={isSelected} onSelect={handleSelect}>
      <div style={fontContentStyle}>
        <div style={{ ...fontNameStyle, fontFamily: `"${family.family}", sans-serif` }}>
          {family.family}
        </div>
        <div style={fontStylesTextStyle}>{family.styles.join(", ")}</div>
      </div>
    </FontListItemBase>
  );
});

// ============================================================================
// Permission Request States
// ============================================================================

function NotSupportedMessage() {
  return (
    <div style={permissionContainerStyle}>
      <div style={messageStyle}>
        Local Font Access API is not supported in this browser.
        Try using Chrome or Edge.
      </div>
    </div>
  );
}

function RequestingMessage() {
  return (
    <div style={permissionContainerStyle}>
      <div style={messageStyle}>Requesting font access...</div>
    </div>
  );
}

function DeniedMessage({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={permissionContainerStyle}>
      <div style={errorMessageStyle}>
        Font access permission was denied.
      </div>
      <button onClick={onRetry} style={buttonStyle}>
        <RefreshIcon size="sm" />
        Try Again
      </button>
    </div>
  );
}

type RequestPermissionProps = {
  onRequest: () => void;
  error: string | null;
};

function RequestPermission({ onRequest, error }: RequestPermissionProps) {
  return (
    <div style={permissionContainerStyle}>
      <div style={messageStyle}>
        Access your system fonts for a personalized experience.
      </div>
      <button onClick={onRequest} style={buttonStyle}>
        Load Local Fonts
      </button>
      {error ? <div style={errorMessageStyle}>{error}</div> : null}
    </div>
  );
}

type PermissionRequestProps = {
  status: LocalFontsStatus;
  error: string | null;
  isSupported: boolean;
  requestFonts: () => void;
};

function PermissionRequest({ status, error, isSupported, requestFonts }: PermissionRequestProps) {
  if (!isSupported) {
    return <NotSupportedMessage />;
  }

  if (status === "requesting") {
    return <RequestingMessage />;
  }

  if (status === "denied") {
    return <DeniedMessage onRetry={requestFonts} />;
  }

  return <RequestPermission onRequest={requestFonts} error={error} />;
}

// ============================================================================
// Font List Content
// ============================================================================

type FontListContentProps = {
  families: readonly LocalFontFamily[];
  selectedFont: string;
  onSelectFont: (fontFamily: string) => void;
};

function FontListContent({ families, selectedFont, onSelectFont }: FontListContentProps) {
  if (families.length === 0) {
    return <div style={emptyStyle}>No fonts found</div>;
  }

  return (
    <>
      {families.map((family) => (
        <FontFamilyItem
          key={family.family}
          family={family}
          isSelected={family.family === selectedFont}
          onSelectFont={onSelectFont}
        />
      ))}
    </>
  );
}

// ============================================================================
// Loaded Content
// ============================================================================

type LoadedContentProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredFamilies: readonly LocalFontFamily[];
  selectedFont: string;
  onSelectFont: (fontFamily: string) => void;
};

function LoadedContent({
  searchQuery,
  onSearchChange,
  filteredFamilies,
  selectedFont,
  onSelectFont,
}: LoadedContentProps) {
  return (
    <>
      <FontSearchInput value={searchQuery} onChange={onSearchChange} />

      <div style={statusBarStyle}>
        <span>{filteredFamilies.length} font families</span>
      </div>

      <div style={listStyle} role="listbox" aria-label="Local fonts">
        <FontListContent
          families={filteredFamilies}
          selectedFont={selectedFont}
          onSelectFont={onSelectFont}
        />
      </div>
    </>
  );
}

// ============================================================================
// Panel Content
// ============================================================================

type PanelContentProps = LoadedContentProps & {
  isLoaded: boolean;
  status: LocalFontsStatus;
  error: string | null;
  isSupported: boolean;
  requestFonts: () => void;
};

function PanelContent(props: PanelContentProps) {
  if (!props.isLoaded) {
    return (
      <PermissionRequest
        status={props.status}
        error={props.error}
        isSupported={props.isSupported}
        requestFonts={props.requestFonts}
      />
    );
  }

  return (
    <LoadedContent
      searchQuery={props.searchQuery}
      onSearchChange={props.onSearchChange}
      filteredFamilies={props.filteredFamilies}
      selectedFont={props.selectedFont}
      onSelectFont={props.onSelectFont}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

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
}: LocalFontListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { status, families, requestFonts, error, isSupported } = useLocalFonts();

  const filteredFamilies = useMemo(() => {
    if (!searchQuery) {
      return families;
    }
    const query = searchQuery.toLowerCase();
    return families.filter((f) => f.family.toLowerCase().includes(query));
  }, [families, searchQuery]);

  const isLoaded = status === "granted";

  return (
    <div style={createContainerStyle(width, maxHeight)}>
      <FontPanelHeader
        title="Local Fonts"
        onClose={onClose}
        onSettings={onSettings}
        onReload={requestFonts}
        showReload={isLoaded}
      />

      <PanelContent
        isLoaded={isLoaded}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredFamilies={filteredFamilies}
        selectedFont={selectedFont}
        onSelectFont={onSelectFont}
        status={status}
        error={error}
        isSupported={isSupported}
        requestFonts={requestFonts}
      />
    </div>
  );
}
