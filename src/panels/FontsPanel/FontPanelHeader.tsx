/**
 * @file Header component for font picker panels with title and action buttons
 */

import type { CSSProperties } from "react";
import { IconButton } from "../../components/IconButton/IconButton";
import { CloseIcon, SettingsIcon, RefreshIcon } from "../../icons";
import {
  COLOR_BORDER,
  COLOR_TEXT,
  SIZE_FONT_MD,
  SIZE_PANEL_HEADER_HEIGHT,
  SPACE_SM,
  SPACE_LG,
} from "../../constants/styles";

export type FontPanelHeaderProps = {
  title: string;
  onClose?: () => void;
  onSettings?: () => void;
  onReload?: () => void;
  showReload?: boolean;
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

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

function ReloadButton({ onReload }: { onReload: () => void }) {
  return (
    <IconButton
      icon={<RefreshIcon size="sm" />}
      aria-label="Reload fonts"
      size="sm"
      onClick={onReload}
    />
  );
}

function SettingsButton({ onSettings }: { onSettings: () => void }) {
  return (
    <IconButton
      icon={<SettingsIcon size="sm" />}
      aria-label="Font settings"
      size="sm"
      onClick={onSettings}
    />
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <IconButton
      icon={<CloseIcon size="sm" />}
      aria-label="Close"
      size="sm"
      onClick={onClose}
    />
  );
}

/** Header for font picker panels with title and optional action buttons */
export function FontPanelHeader({
  title,
  onClose,
  onSettings,
  onReload,
  showReload = false,
}: FontPanelHeaderProps) {
  return (
    <div style={headerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <div style={actionsStyle}>
        {showReload && onReload ? <ReloadButton onReload={onReload} /> : null}
        {onSettings ? <SettingsButton onSettings={onSettings} /> : null}
        {onClose ? <CloseButton onClose={onClose} /> : null}
      </div>
    </div>
  );
}
