/**
 * @file Hooks barrel export
 */

export { useHistory } from "./useHistory";
export type {
  UseHistoryConfig,
  UseHistoryResult,
  HistoryEntry,
} from "./useHistory";

export {
  useFloatingPosition,
  calculateFloatingPosition,
  rectToAnchor,
} from "./useFloatingPosition";
export type {
  FloatingPlacement,
  FloatingAnchor,
  FloatingPositionOptions,
  FloatingPositionResult,
} from "./useFloatingPosition";

export { useFloatingInteractions } from "./useFloatingInteractions";
export type { UseFloatingInteractionsOptions } from "./useFloatingInteractions";
