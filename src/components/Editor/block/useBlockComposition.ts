/**
 * @file Block Composition Hook for IME Support
 *
 * Manages IME composition lifecycle within a single block.
 *
 * Key simplification over global composition:
 * - Composition is contained within a single block
 * - No need for baseValue freezing (styles are block-local)
 * - No global offset recalculation during composition
 *
 * @example
 * ```typescript
 * const { compositionState, handlers } = useBlockComposition({
 *   document,
 *   onDocumentChange,
 * });
 *
 * // Attach handlers to textarea
 * <textarea
 *   onCompositionStart={handlers.handleCompositionStart}
 *   onCompositionUpdate={handlers.handleCompositionUpdate}
 *   onCompositionEnd={handlers.handleCompositionEnd}
 * />
 * ```
 */

import {
  useCallback,
  type CompositionEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { BlockId, BlockDocument } from "../block/blockDocument";
import type { BlockPosition } from "../block/blockPosition";
import { globalOffsetToBlockPosition } from "../block/blockPosition";

// =============================================================================
// Types
// =============================================================================

/**
 * IME composition state within a block.
 *
 * Unlike global CompositionState, this is scoped to a single block,
 * making it simpler to manage and avoiding coordinate system conflicts.
 */
export type BlockCompositionState = {
  /** Whether currently in IME composition mode */
  readonly isComposing: boolean;
  /** Block where composition is happening */
  readonly blockId: BlockId | null;
  /** Offset within the block where composition started */
  readonly localOffset: number;
  /** Current composition text */
  readonly text: string;
  /** Length of text that was selected when composition started */
  readonly replacedLength: number;
};

/**
 * Initial composition state (not composing).
 */
export const INITIAL_BLOCK_COMPOSITION_STATE: BlockCompositionState = {
  isComposing: false,
  blockId: null,
  localOffset: 0,
  text: "",
  replacedLength: 0,
};

// =============================================================================
// Hook Arguments
// =============================================================================

type UseBlockCompositionArgs = {
  /** Current document */
  readonly document: BlockDocument;
  /** State setter for composition state */
  readonly setComposition: Dispatch<SetStateAction<BlockCompositionState>>;
  /** Called when composition ends with final value */
  readonly onCompositionConfirm?: (
    blockId: BlockId,
    localOffset: number,
    text: string,
    replacedLength: number
  ) => void;
};

type UseBlockCompositionResult = {
  readonly handleCompositionStart: (
    e: CompositionEvent<HTMLTextAreaElement>
  ) => void;
  readonly handleCompositionUpdate: (
    e: CompositionEvent<HTMLTextAreaElement>
  ) => void;
  readonly handleCompositionEnd: (
    e: CompositionEvent<HTMLTextAreaElement>
  ) => void;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing IME composition within a block.
 *
 * During composition:
 * - `isComposing` is true
 * - `blockId` identifies the block being edited
 * - `localOffset` is where composition started within the block
 * - `text` contains the current composition text
 * - `replacedLength` is how many characters were selected
 */
export function useBlockComposition({
  document,
  setComposition,
  onCompositionConfirm,
}: UseBlockCompositionArgs): UseBlockCompositionResult {
  const handleCompositionStart = useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const replacedLength = selectionEnd - selectionStart;

      // Convert global offset to block position
      const position = globalOffsetToBlockPosition(document, selectionStart);
      if (!position) {
        return;
      }

      setComposition({
        isComposing: true,
        blockId: position.blockId,
        localOffset: position.offset,
        text: "",
        replacedLength,
      });
    },
    [document, setComposition]
  );

  const handleCompositionUpdate = useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      setComposition((prev) => ({
        ...prev,
        text: e.data,
      }));
    },
    [setComposition]
  );

  const handleCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      setComposition((prev) => {
        // Notify about composition completion
        if (prev.blockId !== null) {
          onCompositionConfirm?.(
            prev.blockId,
            prev.localOffset,
            e.data,
            prev.replacedLength
          );
        }

        return INITIAL_BLOCK_COMPOSITION_STATE;
      });
    },
    [setComposition, onCompositionConfirm]
  );

  return {
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
  };
}

// =============================================================================
// Composition Display Utilities
// =============================================================================

/**
 * Get the position where composition text ends.
 */
export function getCompositionEndPosition(
  state: BlockCompositionState
): BlockPosition | null {
  if (!state.isComposing || state.blockId === null) {
    return null;
  }

  return {
    blockId: state.blockId,
    offset: state.localOffset + state.text.length,
  };
}

/**
 * Check if a position is within the composition range.
 */
export function isPositionInComposition(
  state: BlockCompositionState,
  position: BlockPosition
): boolean {
  if (!state.isComposing || state.blockId === null) {
    return false;
  }

  if (position.blockId !== state.blockId) {
    return false;
  }

  const compositionStart = state.localOffset;
  const compositionEnd = state.localOffset + state.text.length;

  return (
    position.offset >= compositionStart && position.offset <= compositionEnd
  );
}

/**
 * Get composition range for highlighting.
 */
export function getCompositionRange(
  state: BlockCompositionState
): { start: BlockPosition; end: BlockPosition } | null {
  if (!state.isComposing || state.blockId === null) {
    return null;
  }

  return {
    start: {
      blockId: state.blockId,
      offset: state.localOffset,
    },
    end: {
      blockId: state.blockId,
      offset: state.localOffset + state.text.length,
    },
  };
}

// =============================================================================
// Block Content with Composition
// =============================================================================

/**
 * Compute display content for a block during composition.
 *
 * During IME, the textarea already contains the composition text,
 * but we need to track where it is for styling purposes.
 */
export function computeBlockDisplayContent(
  blockContent: string,
  composition: BlockCompositionState,
  blockId: BlockId
): string {
  // If not composing in this block, return original content
  if (!composition.isComposing || composition.blockId !== blockId) {
    return blockContent;
  }

  // During composition, the actual text is already in the block
  // (browser updates textarea.value which we sync to BlockDocument)
  return blockContent;
}

/**
 * Adjust a style segment for composition in a block.
 *
 * Similar to adjustStyleForComposition but simpler because
 * we're working with block-local offsets only.
 */
export function adjustBlockStyleForComposition<
  T extends { start: number; end: number }
>(
  segment: T,
  composition: BlockCompositionState,
  blockId: BlockId
): T | null {
  // Not composing in this block - no adjustment needed
  if (!composition.isComposing || composition.blockId !== blockId) {
    return segment;
  }

  const { localOffset, text, replacedLength } = composition;
  const compositionEnd = localOffset + replacedLength;
  const shift = text.length - replacedLength;

  // Segment is entirely before composition - no change
  if (segment.end <= localOffset) {
    return segment;
  }

  // Segment is entirely inside composition range - skip it
  if (segment.start >= localOffset && segment.end <= compositionEnd) {
    return null;
  }

  // Segment is entirely after composition - shift it
  if (segment.start >= compositionEnd) {
    return {
      ...segment,
      start: segment.start + shift,
      end: segment.end + shift,
    };
  }

  // Segment overlaps with composition start - truncate at composition start
  if (
    segment.start < localOffset &&
    segment.end > localOffset &&
    segment.end <= compositionEnd
  ) {
    return {
      ...segment,
      end: localOffset,
    };
  }

  // Segment overlaps with composition end - start after composition
  if (
    segment.start >= localOffset &&
    segment.start < compositionEnd &&
    segment.end > compositionEnd
  ) {
    return {
      ...segment,
      start: localOffset + text.length,
      end: segment.end + shift,
    };
  }

  // Segment spans entire composition - truncate to before composition
  if (segment.start < localOffset && segment.end > compositionEnd) {
    return {
      ...segment,
      end: localOffset,
    };
  }

  return segment;
}
