/**
 * @file VideoFillEditor component - Editor for video fill settings
 */

import { memo, useMemo, useCallback, type CSSProperties } from "react";
import { Input } from "../Input/Input";
import { Checkbox } from "../Checkbox/Checkbox";
import { Slider } from "../Slider/Slider";
import { PropertyRow } from "../PropertyRow/PropertyRow";
import {
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  RADIUS_SM,
} from "../../constants/styles";
import type { VideoFillValue } from "./fillTypes";

export type VideoFillEditorProps = {
  value: VideoFillValue;
  onChange: (value: VideoFillValue) => void;
  disabled?: boolean;
};

function VideoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="M17 9L21 7V17L17 15" />
    </svg>
  );
}

function renderPreview(
  hasVideo: boolean,
  url: string,
  loop: boolean,
  autoplay: boolean,
  muted: boolean,
  videoStyle: CSSProperties,
  placeholderStyle: CSSProperties,
  iconStyle: CSSProperties,
  textStyle: CSSProperties,
) {
  if (hasVideo) {
    return (
      <video
        src={url}
        loop={loop}
        autoPlay={autoplay}
        muted={muted}
        playsInline
        style={videoStyle}
      />
    );
  }
  return (
    <div style={placeholderStyle}>
      <div style={iconStyle}>
        <VideoIcon />
      </div>
      <span style={textStyle}>Enter video URL</span>
    </div>
  );
}

// Static styles
const previewContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "120px",
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  overflow: "hidden",
  backgroundColor: "#000",
};

const videoStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  gap: SPACE_SM,
};

const iconStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
};

const textStyle: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT_MUTED,
};

const checkboxGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

const opacityContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
  width: "100%",
};

const opacityValueStyle: CSSProperties = {
  width: "32px",
  textAlign: "right",
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  fontVariantNumeric: "tabular-nums",
};

const sliderContainerStyle: CSSProperties = {
  flex: 1,
};

/** Video fill editor with URL input, sizing, and playback controls */
export const VideoFillEditor = memo(function VideoFillEditor({
  value,
  onChange,
  disabled = false,
}: VideoFillEditorProps) {
  const hasVideo = Boolean(value.url);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      opacity: disabled ? 0.5 : 1,
    }),
    [disabled],
  );

  const handleUrlChange = useCallback(
    (url: string) => {
      onChange({ ...value, url });
    },
    [onChange, value],
  );

  const handleLoopChange = useCallback(
    (loop: boolean) => {
      onChange({ ...value, loop });
    },
    [onChange, value],
  );

  const handleAutoplayChange = useCallback(
    (autoplay: boolean) => {
      onChange({ ...value, autoplay });
    },
    [onChange, value],
  );

  const handleMutedChange = useCallback(
    (muted: boolean) => {
      onChange({ ...value, muted });
    },
    [onChange, value],
  );

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      onChange({ ...value, opacity: Math.round(opacity * 100) });
    },
    [onChange, value],
  );

  return (
    <div style={containerStyle}>
      <div style={previewContainerStyle}>
        {renderPreview(
          hasVideo,
          value.url,
          value.loop,
          value.autoplay,
          value.muted,
          videoStyle,
          placeholderStyle,
          iconStyle,
          textStyle,
        )}
      </div>

      <PropertyRow label="URL">
        <Input
          value={value.url}
          onChange={handleUrlChange}
          placeholder="https://example.com/video.mp4"
          size="sm"
          disabled={disabled}
          aria-label="Video URL"
        />
      </PropertyRow>

      <PropertyRow label="Playback">
        <div style={checkboxGroupStyle}>
          <Checkbox
            checked={value.loop}
            onChange={handleLoopChange}
            label="Loop"
            size="sm"
            disabled={disabled || !hasVideo}
          />
          <Checkbox
            checked={value.autoplay}
            onChange={handleAutoplayChange}
            label="Autoplay"
            size="sm"
            disabled={disabled || !hasVideo}
          />
          <Checkbox
            checked={value.muted}
            onChange={handleMutedChange}
            label="Muted"
            size="sm"
            disabled={disabled || !hasVideo}
          />
        </div>
      </PropertyRow>

      <PropertyRow label="Opacity">
        <div style={opacityContainerStyle}>
          <div style={sliderContainerStyle}>
            <Slider
              value={value.opacity / 100}
              onChange={handleOpacityChange}
              background="linear-gradient(to right, transparent, #000)"
              disabled={disabled || !hasVideo}
              aria-label="Video opacity"
            />
          </div>
          <span style={opacityValueStyle}>{value.opacity}%</span>
        </div>
      </PropertyRow>
    </div>
  );
});
