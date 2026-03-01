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

export { useAnimationLoop } from "./useAnimationLoop";
export type { AnimationCallback, UseAnimationLoopResult } from "./useAnimationLoop";

export { useAutoResize } from "./useAutoResize";
export type { UseAutoResizeOptions } from "./useAutoResize";

export { useSpeechRecognition } from "./useSpeechRecognition";
export type {
  UseSpeechRecognitionOptions,
  UseSpeechRecognitionResult,
} from "./useSpeechRecognition";

export { useMediaStream } from "./useMediaStream";
export type { UseMediaStreamOptions, UseMediaStreamResult } from "./useMediaStream";
