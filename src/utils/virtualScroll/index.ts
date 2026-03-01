/**
 * @file Virtual scroll utilities for efficient large list rendering
 */

export { createSegmentTree, SegmentTree } from "./SegmentTree";
export type { SegmentTree as SegmentTreeType } from "./SegmentTree";

export { createVirtualScrollEngine } from "./VirtualScrollEngine";
export type {
  VirtualItem,
  VisibleRange,
  EngineConfig,
  EngineState,
  VirtualScrollCalculator,
} from "./VirtualScrollEngine";

export { createVirtualGrid2DEngine } from "./VirtualGrid2DEngine";
export type {
  VirtualGridItem,
  VirtualGridRange,
  Grid2DConfig,
  VirtualGrid2DCalculator,
} from "./VirtualGrid2DEngine";
