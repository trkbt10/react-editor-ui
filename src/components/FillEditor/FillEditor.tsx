/**
 * @file FillEditor component - Switch between solid, gradient, image, pattern, and video fill modes
 */

import type { CSSProperties } from "react";
import { SPACE_MD } from "../../constants/styles";
import { ColorInput } from "../ColorInput/ColorInput";
import type { ColorValue } from "../ColorInput/ColorInput";
import { GradientEditor } from "../GradientEditor/GradientEditor";
import type { GradientValue } from "../GradientEditor/gradientTypes";
import { createDefaultGradient } from "../GradientEditor/gradientUtils";
import { FillTypeSelector } from "./FillTypeSelector";
import { ImageFillEditor } from "./ImageFillEditor";
import { PatternEditor } from "./PatternEditor";
import { VideoFillEditor } from "./VideoFillEditor";
import type {
  FillValue,
  FillType,
  ImageFillValue,
  PatternFillValue,
  VideoFillValue,
} from "./fillTypes";
import {
  createDefaultImageFill,
  createDefaultPatternFill,
  createDefaultVideoFill,
  extractPrimaryColor,
} from "./fillUtils";

export type FillEditorProps = {
  value: FillValue;
  onChange: (value: FillValue) => void;
  onImageUpload?: () => void;
  onPatternSelect?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

/** Editor panel that switches between solid, gradient, image, pattern, and video fill types */
export function FillEditor({
  value,
  onChange,
  onImageUpload,
  onPatternSelect,
  disabled = false,
  "aria-label": ariaLabel = "Fill editor",
}: FillEditorProps) {
  const handleTypeChange = (newType: FillType) => {
    if (newType === value.type) {
      return;
    }

    switch (newType) {
      case "solid": {
        const defaultColor = extractPrimaryColor(value);
        onChange({ type: "solid", color: defaultColor });
        break;
      }
      case "gradient": {
        const defaultGradient = createDefaultGradient();
        if (value.type === "solid") {
          defaultGradient.stops[0].color = { ...value.color };
        }
        onChange({ type: "gradient", gradient: defaultGradient });
        break;
      }
      case "image": {
        onChange({ type: "image", image: createDefaultImageFill() });
        break;
      }
      case "pattern": {
        onChange({ type: "pattern", pattern: createDefaultPatternFill() });
        break;
      }
      case "video": {
        onChange({ type: "video", video: createDefaultVideoFill() });
        break;
      }
    }
  };

  const handleSolidColorChange = (color: ColorValue) => {
    if (value.type === "solid") {
      onChange({ type: "solid", color });
    }
  };

  const handleGradientChange = (gradient: GradientValue) => {
    if (value.type === "gradient") {
      onChange({ type: "gradient", gradient });
    }
  };

  const handleImageChange = (image: ImageFillValue) => {
    if (value.type === "image") {
      onChange({ type: "image", image });
    }
  };

  const handlePatternChange = (pattern: PatternFillValue) => {
    if (value.type === "pattern") {
      onChange({ type: "pattern", pattern });
    }
  };

  const handleVideoChange = (video: VideoFillValue) => {
    if (value.type === "video") {
      onChange({ type: "video", video });
    }
  };

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={containerStyle}
    >
      <FillTypeSelector
        value={value.type}
        onChange={handleTypeChange}
        disabled={disabled}
        aria-label="Fill type"
      />

      {renderFillContent(
        value,
        handleSolidColorChange,
        handleGradientChange,
        handleImageChange,
        handlePatternChange,
        handleVideoChange,
        onImageUpload,
        onPatternSelect,
        disabled,
      )}
    </div>
  );
}

function renderFillContent(
  value: FillValue,
  onSolidChange: (color: ColorValue) => void,
  onGradientChange: (gradient: GradientValue) => void,
  onImageChange: (image: ImageFillValue) => void,
  onPatternChange: (pattern: PatternFillValue) => void,
  onVideoChange: (video: VideoFillValue) => void,
  onImageUpload: (() => void) | undefined,
  onPatternSelect: (() => void) | undefined,
  disabled: boolean,
) {
  switch (value.type) {
    case "solid": {
      return (
        <ColorInput
          value={value.color}
          onChange={onSolidChange}
          disabled={disabled}
        />
      );
    }
    case "gradient": {
      return (
        <GradientEditor
          value={value.gradient}
          onChange={onGradientChange}
          disabled={disabled}
        />
      );
    }
    case "image": {
      return (
        <ImageFillEditor
          value={value.image}
          onChange={onImageChange}
          onUpload={onImageUpload}
          disabled={disabled}
        />
      );
    }
    case "pattern": {
      return (
        <PatternEditor
          value={value.pattern}
          onChange={onPatternChange}
          onSelectSource={onPatternSelect}
          disabled={disabled}
        />
      );
    }
    case "video": {
      return (
        <VideoFillEditor
          value={value.video}
          onChange={onVideoChange}
          disabled={disabled}
        />
      );
    }
  }
}
