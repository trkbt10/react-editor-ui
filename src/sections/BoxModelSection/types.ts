/**
 * @file BoxModelSection types
 */

import type {
  BoxModelData,
  BoxModelDisplayMode,
  BoxModelEditableFeatures,
} from "../../components/BoxModelEditor/types";

export type BoxModelSectionProps = {
  data: BoxModelData;
  onChange: (data: BoxModelData) => void;
  /** Display mode (default: proportional) */
  displayMode?: BoxModelDisplayMode;
  /** Editable features (default: all enabled) */
  editable?: BoxModelEditableFeatures;
  /** @deprecated Use editable.margin instead */
  showMargin?: boolean;
  /** @deprecated Use editable.radius instead */
  showRadius?: boolean;
  className?: string;
};
