/**
 * @file FilePreview component - File preview card with thumbnail and remove button
 *
 * @description
 * A preview card for displaying attached files in chat input.
 * Supports image thumbnails, file type icons, and removal.
 *
 * @example
 * ```tsx
 * import { FilePreview } from "react-editor-ui/chat/ChatInput";
 *
 * <FilePreview
 *   file={file}
 *   onRemove={() => handleRemove(file)}
 * />
 * ```
 */

import { memo, useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  RADIUS_MD,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

// =============================================================================
// Types
// =============================================================================

export type FileInfo = {
  name: string;
  size?: number;
  type?: string;
  url?: string;
};

export type FilePreviewProps = {
  /** File object or file info */
  file: File | FileInfo;
  /** Custom thumbnail URL (overrides auto-generated) */
  thumbnail?: string;
  /** Custom icon to display for non-image files */
  icon?: ReactNode;
  /** Called when remove button is clicked */
  onRemove?: () => void;
  /** Custom class name */
  className?: string;
};

// =============================================================================
// Constants
// =============================================================================

const THUMBNAIL_SIZE = 48;

// =============================================================================
// Icons
// =============================================================================

const CloseIcon = memo(function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
});

const FileIcon = memo(function FileIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
});

// =============================================================================
// Utilities
// =============================================================================

function isImageType(type: string | undefined): boolean {
  return type?.startsWith("image/") ?? false;
}

function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined) {return "";}
  if (bytes < 1024) {return `${bytes} B`;}
  if (bytes < 1024 * 1024) {return `${(bytes / 1024).toFixed(1)} KB`;}
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileInfo(file: File | FileInfo): FileInfo {
  if (file instanceof File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }
  return file;
}

// Static styles for thumbnail content
const thumbnailImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const iconContainerStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
};

/** Render thumbnail image or fallback icon */
function renderThumbnailContent(
  thumbnailUrl: string | null,
  altText: string,
  customIcon: ReactNode | undefined,
): ReactNode {
  if (thumbnailUrl) {
    return <img src={thumbnailUrl} alt={altText} style={thumbnailImageStyle} />;
  }
  return <span style={iconContainerStyle}>{customIcon || <FileIcon />}</span>;
}

// =============================================================================
// Component
// =============================================================================

export const FilePreview = memo(function FilePreview({
  file,
  thumbnail: thumbnailProp,
  icon,
  onRemove,
  className,
}: FilePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const fileInfo = getFileInfo(file);
  const isImage = isImageType(fileInfo.type);

  // Compute blob URL for File objects (sync)
  const blobUrl = useMemo(() => {
    // Cleanup previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Create new blob URL if applicable
    if (file instanceof File && isImage) {
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      return url;
    }
    return null;
  }, [file, isImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Compute thumbnail URL (prioritized: prop > fileInfo.url > blob)
  const thumbnailUrl = useMemo(() => {
    if (thumbnailProp) {
      return thumbnailProp;
    }
    if (fileInfo.url) {
      return fileInfo.url;
    }
    return blobUrl;
  }, [thumbnailProp, fileInfo.url, blobUrl]);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      gap: SPACE_MD,
      paddingTop: SPACE_SM,
      paddingRight: SPACE_MD,
      paddingBottom: SPACE_SM,
      paddingLeft: SPACE_SM,
      backgroundColor: isHovered ? COLOR_HOVER : COLOR_SURFACE_RAISED,
      border: `1px solid ${COLOR_BORDER}`,
      borderRadius: RADIUS_MD,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      cursor: "default",
      userSelect: "none",
      maxWidth: "100%",
    }),
    [isHovered],
  );

  const thumbnailContainerStyle = useMemo<CSSProperties>(
    () => ({
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: RADIUS_MD,
      overflow: "hidden",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLOR_HOVER,
    }),
    [],
  );

  const infoStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }),
    [],
  );

  const nameStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: SIZE_FONT_SM,
      color: COLOR_TEXT,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    [],
  );

  const sizeStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: SIZE_FONT_XS,
      color: COLOR_TEXT_MUTED,
    }),
    [],
  );

  const closeButtonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      padding: 0,
      border: "none",
      backgroundColor: isCloseHovered ? COLOR_HOVER : "transparent",
      borderRadius: "50%",
      color: COLOR_TEXT_MUTED,
      cursor: "pointer",
      flexShrink: 0,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isCloseHovered],
  );

  const handlers = useMemo(
    () => ({
      onPointerEnter: () => setIsHovered(true),
      onPointerLeave: () => setIsHovered(false),
    }),
    [],
  );

  const closeHandlers = useMemo(
    () => ({
      onPointerEnter: () => setIsCloseHovered(true),
      onPointerLeave: () => setIsCloseHovered(false),
    }),
    [],
  );

  const handleRemoveClick = useCallback(() => {
    onRemove?.();
  }, [onRemove]);

  return (
    <div
      className={className}
      style={containerStyle}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
    >
      {/* Thumbnail or Icon */}
      <div style={thumbnailContainerStyle}>
        {renderThumbnailContent(thumbnailUrl, fileInfo.name, icon)}
      </div>

      {/* File info */}
      <div style={infoStyle}>
        <span style={nameStyle} title={fileInfo.name}>
          {fileInfo.name}
        </span>
        {fileInfo.size !== undefined && (
          <span style={sizeStyle}>{formatFileSize(fileInfo.size)}</span>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          onPointerEnter={closeHandlers.onPointerEnter}
          onPointerLeave={closeHandlers.onPointerLeave}
          style={closeButtonStyle}
          aria-label={`Remove ${fileInfo.name}`}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
});
