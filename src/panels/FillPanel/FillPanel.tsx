/**
 * @file FillPanel component - Fill type switching and editing
 *
 * @description
 * Fill editor panel content supporting solid, gradient, image, pattern, and video fills.
 * Includes a type selector and corresponding editor section for each fill type.
 * Use for shape fill properties in design tools. Wrap with PanelFrame for floating panel UI.
 *
 * @example
 * ```tsx
 * import { FillPanel } from "react-editor-ui/panels/FillPanel";
 * import { PanelFrame } from "react-editor-ui/PanelFrame";
 *
 * const [fill, setFill] = useState({
 *   type: "solid",
 *   color: { hex: "#3b82f6", opacity: 100, visible: true },
 * });
 *
 * <PanelFrame title="Fill" onClose={handleClose}>
 *   <FillPanel value={fill} onChange={setFill} />
 * </PanelFrame>
 * ```
 */

import { memo, useCallback, type CSSProperties } from "react";
import { SPACE_MD } from "../../themes/styles";
import { ColorInput } from "../../components/ColorInput/ColorInput";
import { FillTypeSelector } from "../../components/FillTypeSelector/FillTypeSelector";
import type { ColorValue } from "../../utils/color/types";
import type { GradientValue } from "../../utils/gradient/types";
import { GradientSection } from "../../sections/GradientSection/GradientSection";
import { ImageFillSection } from "../../sections/ImageFillSection/ImageFillSection";
import { PatternFillSection } from "../../sections/PatternFillSection/PatternFillSection";
import { VideoFillSection } from "../../sections/VideoFillSection/VideoFillSection";
import type { ImageFillValue } from "../../sections/ImageFillSection/types";
import type { PatternFillValue } from "../../sections/PatternFillSection/types";
import type { VideoFillValue } from "../../sections/VideoFillSection/types";
import type { FillType, FillValue } from "./types";
import { createDefaultGradient } from "../../utils/gradient/utils";
import {
  createDefaultImageFill,
  createDefaultPatternFill,
  createDefaultVideoFill,
  extractPrimaryColor,
} from "./utils";

export type FillPanelProps = {
  value: FillValue;
  onChange: (value: FillValue) => void;
  onImageUpload?: () => void;
  onPatternSelect?: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_MD,
};

/**
 * Fill editor panel content with type selection and corresponding editor sections.
 */
export const FillPanel = memo(function FillPanel({
  value,
  onChange,
  onImageUpload,
  onPatternSelect,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Fill editor",
}: FillPanelProps) {
  const handleTypeChange = useCallback((newType: FillType) => {
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
  }, [value, onChange]);

  const handleSolidColorChange = useCallback((color: ColorValue) => {
    onChange({ type: "solid", color });
  }, [onChange]);

  const handleGradientChange = useCallback((gradient: GradientValue) => {
    onChange({ type: "gradient", gradient });
  }, [onChange]);

  const handleImageChange = useCallback((image: ImageFillValue) => {
    onChange({ type: "image", image });
  }, [onChange]);

  const handlePatternChange = useCallback((pattern: PatternFillValue) => {
    onChange({ type: "pattern", pattern });
  }, [onChange]);

  const handleVideoChange = useCallback((video: VideoFillValue) => {
    onChange({ type: "video", video });
  }, [onChange]);

  const renderContent = () => {
    switch (value.type) {
      case "solid": {
        return (
          <ColorInput
            value={value.color}
            onChange={handleSolidColorChange}
            disabled={disabled}
          />
        );
      }
      case "gradient": {
        return (
          <GradientSection
            value={value.gradient}
            onChange={handleGradientChange}
            disabled={disabled}
          />
        );
      }
      case "image": {
        return (
          <ImageFillSection
            value={value.image}
            onChange={handleImageChange}
            onUpload={onImageUpload}
            disabled={disabled}
          />
        );
      }
      case "pattern": {
        return (
          <PatternFillSection
            value={value.pattern}
            onChange={handlePatternChange}
            onSelectSource={onPatternSelect}
            disabled={disabled}
          />
        );
      }
      case "video": {
        return (
          <VideoFillSection
            value={value.video}
            onChange={handleVideoChange}
            disabled={disabled}
          />
        );
      }
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={containerStyle}
    >
      <FillTypeSelector
        value={value.type}
        onChange={handleTypeChange}
        disabled={disabled}
        aria-label="Fill type"
      />

      {renderContent()}
    </div>
  );
});
