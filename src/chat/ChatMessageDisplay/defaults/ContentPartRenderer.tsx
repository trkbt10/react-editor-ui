/**
 * @file ContentPartRenderer - Renders individual content parts (text, image, video, etc.)
 */

import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  ContentPart,
  ContentPartComponentMap,
  ContentPartRendererProps,
  TextContentPart,
  ImageContentPart,
  VideoContentPart,
  AudioContentPart,
  FileContentPart,
} from "../types";
import {
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_BORDER,
  RADIUS_MD,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
} from "../../../themes/styles";

// =============================================================================
// Default Text Renderer
// =============================================================================

const textStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const DefaultTextPart = memo(function DefaultTextPart({
  part,
}: ContentPartRendererProps<TextContentPart>) {
  return <span style={textStyle}>{part.text}</span>;
});

// =============================================================================
// Default Image Renderer
// =============================================================================

const imageContainerStyle: CSSProperties = {
  maxWidth: "100%",
  marginTop: SPACE_SM,
  marginBottom: SPACE_SM,
};

const imageStyle: CSSProperties = {
  maxWidth: "100%",
  maxHeight: 400,
  borderRadius: RADIUS_MD,
  objectFit: "contain",
};

const DefaultImagePart = memo(function DefaultImagePart({
  part,
}: ContentPartRendererProps<ImageContentPart>) {
  const style = useMemo<CSSProperties>(
    () => ({
      ...imageStyle,
      width: part.width,
      height: part.height,
    }),
    [part.width, part.height],
  );

  return (
    <div style={imageContainerStyle}>
      <img src={part.url} alt={part.alt ?? ""} style={style} loading="lazy" />
    </div>
  );
});

// =============================================================================
// Default Video Renderer
// =============================================================================

const videoStyle: CSSProperties = {
  maxWidth: "100%",
  maxHeight: 400,
  borderRadius: RADIUS_MD,
  marginTop: SPACE_SM,
  marginBottom: SPACE_SM,
};

const DefaultVideoPart = memo(function DefaultVideoPart({
  part,
}: ContentPartRendererProps<VideoContentPart>) {
  const style = useMemo<CSSProperties>(
    () => ({
      ...videoStyle,
      width: part.width,
      height: part.height,
    }),
    [part.width, part.height],
  );

  return (
    <video
      src={part.url}
      poster={part.poster}
      style={style}
      controls
      preload="metadata"
    />
  );
});

// =============================================================================
// Default Audio Renderer
// =============================================================================

const audioContainerStyle: CSSProperties = {
  marginTop: SPACE_SM,
  marginBottom: SPACE_SM,
};

const audioStyle: CSSProperties = {
  width: "100%",
  maxWidth: 400,
};

const DefaultAudioPart = memo(function DefaultAudioPart({
  part,
}: ContentPartRendererProps<AudioContentPart>) {
  return (
    <div style={audioContainerStyle}>
      <audio src={part.url} style={audioStyle} controls preload="metadata" />
    </div>
  );
});

// =============================================================================
// Default File Renderer
// =============================================================================

const fileContainerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: SPACE_SM,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  backgroundColor: COLOR_SURFACE_RAISED,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  marginTop: SPACE_SM,
  marginBottom: SPACE_SM,
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  textDecoration: "none",
};

const fileIconStyle: CSSProperties = {
  width: 20,
  height: 20,
  flexShrink: 0,
};

const fileInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
};

const fileNameStyle: CSSProperties = {
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const fileSizeStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
};

/** Format file size in human readable format */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileIcon = memo(function FileIcon() {
  return (
    <svg
      style={fileIconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
});

const DefaultFilePart = memo(function DefaultFilePart({
  part,
}: ContentPartRendererProps<FileContentPart>) {
  const content = (
    <>
      <FileIcon />
      <div style={fileInfoStyle}>
        <span style={fileNameStyle}>{part.name}</span>
        {part.size !== undefined && (
          <span style={fileSizeStyle}>{formatFileSize(part.size)}</span>
        )}
      </div>
    </>
  );

  if (part.url) {
    return (
      <a
        href={part.url}
        download={part.name}
        style={fileContainerStyle}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <div style={fileContainerStyle}>{content}</div>;
});

// =============================================================================
// Default Components Map
// =============================================================================

export const defaultContentComponents: ContentPartComponentMap = {
  text: DefaultTextPart,
  image: DefaultImagePart,
  video: DefaultVideoPart,
  audio: DefaultAudioPart,
  file: DefaultFilePart,
  // embed and custom are not rendered by default
};

// =============================================================================
// Content Part Renderer
// =============================================================================

type ContentPartRendererFullProps = {
  part: ContentPart;
  message: ContentPartRendererProps["message"];
  components?: ContentPartComponentMap;
};

/** Merges user-provided components with defaults */
function mergeContentComponents(
  components: ContentPartComponentMap | undefined,
): ContentPartComponentMap {
  if (!components) {
    return defaultContentComponents;
  }
  return { ...defaultContentComponents, ...components };
}

/** Renders a single content part */
function renderPart(
  part: ContentPart,
  message: ContentPartRendererProps["message"],
  merged: ContentPartComponentMap,
): ReactNode {
  switch (part.type) {
    case "text": {
      const C = merged.text;
      return C ? <C part={part} message={message} /> : part.text;
    }
    case "image": {
      const C = merged.image;
      return C ? <C part={part} message={message} /> : null;
    }
    case "video": {
      const C = merged.video;
      return C ? <C part={part} message={message} /> : null;
    }
    case "audio": {
      const C = merged.audio;
      return C ? <C part={part} message={message} /> : null;
    }
    case "file": {
      const C = merged.file;
      return C ? <C part={part} message={message} /> : null;
    }
    case "embed": {
      const C = merged.embed;
      return C ? <C part={part} message={message} /> : null;
    }
    case "custom": {
      const C = merged.custom;
      return C ? <C part={part} message={message} /> : null;
    }
    default:
      return null;
  }
}

export const ContentPartRenderer = memo(function ContentPartRenderer({
  part,
  message,
  components,
}: ContentPartRendererFullProps) {
  const merged = useMemo(() => mergeContentComponents(components), [components]);

  return useMemo(
    () => renderPart(part, message, merged),
    [part, message, merged],
  );
});
