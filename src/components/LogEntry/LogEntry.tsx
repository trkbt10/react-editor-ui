/**
 * @file LogEntry component - Log message display
 */

import { memo, useMemo, useCallback } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_LOG_INFO,
  COLOR_LOG_WARNING,
  COLOR_LOG_ERROR,
  COLOR_LOG_DEBUG,
  COLOR_LOG_SUCCESS,
  FONT_WEIGHT_SEMIBOLD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

function renderTimestamp(
  timestamp: string | Date | undefined,
  timestampStyle: CSSProperties,
) {
  if (!timestamp) {
    return null;
  }
  return <span style={timestampStyle}>{formatTimestamp(timestamp)}</span>;
}

function renderSource(source: string | undefined, sourceStyle: CSSProperties) {
  if (!source) {
    return null;
  }
  return <span style={sourceStyle}>{source}</span>;
}

function renderDetails(details: string | undefined, detailsStyle: CSSProperties) {
  if (!details) {
    return null;
  }
  return <div style={detailsStyle}>{details}</div>;
}

export type LogEntryProps = {
  message: string;
  level?: "info" | "warning" | "error" | "debug" | "success";
  timestamp?: string | Date;
  source?: string;
  details?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

const levelColors = {
  info: COLOR_LOG_INFO,
  warning: COLOR_LOG_WARNING,
  error: COLOR_LOG_ERROR,
  debug: COLOR_LOG_DEBUG,
  success: COLOR_LOG_SUCCESS,
};

const levelLabels = {
  info: "INFO",
  warning: "WARN",
  error: "ERROR",
  debug: "DEBUG",
  success: "OK",
};

function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

/** Single log entry row with timestamp, level indicator, and message */
export const LogEntry = memo(function LogEntry({
  message,
  level = "info",
  timestamp,
  source,
  details,
  selected = false,
  onClick,
  className,
}: LogEntryProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_XS,
      padding: `${SPACE_SM} ${SPACE_MD}`,
      backgroundColor: selected ? COLOR_SELECTED : "transparent",
      cursor: onClick ? "pointer" : "default",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      fontFamily: "monospace",
    }),
    [selected, onClick],
  );

  const headerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_SM,
      fontSize: SIZE_FONT_SM,
    }),
    [],
  );

  const levelStyle = useMemo<CSSProperties>(
    () => ({
      color: levelColors[level],
      fontWeight: FONT_WEIGHT_SEMIBOLD,
      minWidth: "45px",
    }),
    [level],
  );

  const timestampStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_XS,
    }),
    [],
  );

  const sourceStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_XS,
    }),
    [],
  );

  const messageStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      color: COLOR_TEXT,
      wordBreak: "break-word",
    }),
    [],
  );

  const detailsStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_XS,
      paddingLeft: SPACE_MD,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }),
    [],
  );

  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (onClick && !selected) {
        e.currentTarget.style.backgroundColor = COLOR_HOVER;
      }
    },
    [onClick, selected],
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (onClick && !selected) {
        e.currentTarget.style.backgroundColor = "transparent";
      }
    },
    [onClick, selected],
  );

  return (
    <div
      role={onClick ? "button" : "log"}
      aria-selected={selected}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={containerStyle}
    >
      <div style={headerStyle}>
        <span style={levelStyle}>[{levelLabels[level]}]</span>
        {renderTimestamp(timestamp, timestampStyle)}
        {renderSource(source, sourceStyle)}
        <span style={messageStyle}>{message}</span>
      </div>
      {renderDetails(details, detailsStyle)}
    </div>
  );
});
