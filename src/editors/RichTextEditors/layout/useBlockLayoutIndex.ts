/**
 * @file useBlockLayoutIndex Hook
 *
 * React hook for memoized block layout index creation.
 * Rebuilds only when document structure or layout config changes.
 *
 * BlockLayoutIndex is the Single Source of Truth for layout calculations.
 */

import { useMemo } from "react";
import type { BlockTypeStyleMap } from "../block/blockDocument";
import type { BlockLayoutIndex, LayoutConfig } from "./types";
import { buildBlockLayoutIndex, type BuildBlockLayoutIndexOptions } from "./BlockLayoutIndex";

/**
 * Options for useBlockLayoutIndex hook.
 */
export type UseBlockLayoutIndexOptions = BuildBlockLayoutIndexOptions;

/**
 * Hook for creating a memoized BlockLayoutIndex.
 *
 * The resulting BlockLayoutIndex is the Single Source of Truth for:
 * - Line positions and heights
 * - Content padding (config.paddingLeft, config.paddingTop)
 *
 * The layout index is rebuilt when:
 * - The document blocks change
 * - The layout config changes
 * - The block type styles change
 *
 * @param options - Hook options including document and layout config
 * @returns BlockLayoutIndex with precomputed line positions and layout config
 *
 * @example
 * ```tsx
 * const layoutIndex = useBlockLayoutIndex({
 *   document,
 *   config: { paddingLeft: DEFAULT_PADDING_PX, paddingTop: DEFAULT_PADDING_PX, baseLineHeight: 21 },
 *   blockTypeStyles: document.blockTypeStyles,
 * });
 * // layoutIndex.config is the SSoT for position calculations
 * ```
 */
export function useBlockLayoutIndex(options: UseBlockLayoutIndexOptions): BlockLayoutIndex {
  const { document, config, blockTypeStyles } = options;

  return useMemo(
    () => buildBlockLayoutIndex({ document, config, blockTypeStyles }),
    [document, config, blockTypeStyles]
  );
}
