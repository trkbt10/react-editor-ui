/**
 * @file LibraryEmptyState - Empty state display for LibraryBrowser
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { COLOR_TEXT_MUTED, SIZE_FONT_SM, SPACE_XL } from "../../themes/styles";
import type { LibraryEmptyStateProps } from "./types";

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: SPACE_XL,
  textAlign: "center",
};

const textStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

export const LibraryEmptyState = memo(function LibraryEmptyState({
  message,
}: LibraryEmptyStateProps) {
  return (
    <div style={containerStyle}>
      <p style={textStyle}>{message}</p>
    </div>
  );
});
