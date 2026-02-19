/**
 * @file BoxModelSection types
 */

import type { BoxModelData } from "../../components/BoxModelEditor/types";

export type BoxModelSectionProps = {
  data: BoxModelData;
  onChange: (data: BoxModelData) => void;
  /** Show margin layer (default: true) */
  showMargin?: boolean;
  /** Show border-radius controls (default: true) */
  showRadius?: boolean;
  className?: string;
};
