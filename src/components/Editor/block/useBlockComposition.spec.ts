/**
 * @file Block Composition Tests
 */

import { renderHook, act } from "@testing-library/react";
import {
  useBlockComposition,
  INITIAL_BLOCK_COMPOSITION_STATE,
  getCompositionEndPosition,
  isPositionInComposition,
  getCompositionRange,
  computeBlockDisplayContent,
  adjustBlockStyleForComposition,
  type BlockCompositionState,
} from "../block/useBlockComposition";
import { createBlockDocument, type BlockId } from "../block/blockDocument";

// Mock crypto.randomUUID for deterministic tests
const createUuidCounter = () => {
  const state = { counter: 0 };
  return {
    next: () => ++state.counter,
    reset: () => { state.counter = 0; },
  };
};
const uuidCounter = createUuidCounter();

beforeEach(() => {
  uuidCounter.reset();
  vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
    return `test-uuid-${uuidCounter.next()}` as `${string}-${string}-${string}-${string}-${string}`;
  });
});

// =============================================================================
// Initial State
// =============================================================================

describe("INITIAL_BLOCK_COMPOSITION_STATE", () => {
  it("has correct initial values", () => {
    expect(INITIAL_BLOCK_COMPOSITION_STATE).toEqual({
      isComposing: false,
      blockId: null,
      localOffset: 0,
      text: "",
      replacedLength: 0,
    });
  });
});

// =============================================================================
// useBlockComposition Hook
// =============================================================================

describe("useBlockComposition", () => {
  const createMockTextarea = (selectionStart: number, selectionEnd: number) =>
    ({
      selectionStart,
      selectionEnd,
      value: "Hello World",
    }) as HTMLTextAreaElement;

  const createMockEvent = <T extends HTMLElement>(
    currentTarget: T,
    data: string = ""
  ) =>
    ({
      currentTarget,
      data,
    }) as React.CompositionEvent<T>;

  it("handles composition start", () => {
    const doc = createBlockDocument("Hello World");
    const setComposition = vi.fn();

    const { result } = renderHook(() =>
      useBlockComposition({
        document: doc,
        setComposition,
      })
    );

    const textarea = createMockTextarea(6, 6); // Cursor at "W"
    const event = createMockEvent(textarea);

    act(() => {
      result.current.handleCompositionStart(event);
    });

    expect(setComposition).toHaveBeenCalledWith({
      isComposing: true,
      blockId: doc.blocks[0].id,
      localOffset: 6,
      text: "",
      replacedLength: 0,
    });
  });

  it("handles composition start with selection", () => {
    const doc = createBlockDocument("Hello World");
    const setComposition = vi.fn();

    const { result } = renderHook(() =>
      useBlockComposition({
        document: doc,
        setComposition,
      })
    );

    const textarea = createMockTextarea(6, 11); // "World" selected
    const event = createMockEvent(textarea);

    act(() => {
      result.current.handleCompositionStart(event);
    });

    expect(setComposition).toHaveBeenCalledWith({
      isComposing: true,
      blockId: doc.blocks[0].id,
      localOffset: 6,
      text: "",
      replacedLength: 5,
    });
  });

  it("handles composition update", () => {
    const doc = createBlockDocument("Hello");
    const setComposition = vi.fn();

    const { result } = renderHook(() =>
      useBlockComposition({
        document: doc,
        setComposition,
      })
    );

    const textarea = createMockTextarea(0, 0);
    const event = createMockEvent(textarea, "こんにちは");

    act(() => {
      result.current.handleCompositionUpdate(event);
    });

    // setComposition is called with a function
    expect(setComposition).toHaveBeenCalled();
    const updateFn = setComposition.mock.calls[0][0] as (
      prev: BlockCompositionState
    ) => BlockCompositionState;
    const newState = updateFn({
      isComposing: true,
      blockId: "test" as BlockId,
      localOffset: 0,
      text: "",
      replacedLength: 0,
    });
    expect(newState.text).toBe("こんにちは");
  });

  it("handles composition end", () => {
    const doc = createBlockDocument("Hello");
    const setComposition = vi.fn();
    const onCompositionConfirm = vi.fn();

    const { result } = renderHook(() =>
      useBlockComposition({
        document: doc,
        setComposition,
        onCompositionConfirm,
      })
    );

    const textarea = createMockTextarea(0, 0);
    const event = createMockEvent(textarea, "確定");

    act(() => {
      result.current.handleCompositionEnd(event);
    });

    expect(setComposition).toHaveBeenCalled();
    // Check that the callback resets state
    const updateFn = setComposition.mock.calls[0][0] as (
      prev: BlockCompositionState
    ) => BlockCompositionState;
    const mockPrevState: BlockCompositionState = {
      isComposing: true,
      blockId: "b1" as BlockId,
      localOffset: 5,
      text: "入力中",
      replacedLength: 0,
    };
    const newState = updateFn(mockPrevState);
    expect(newState).toEqual(INITIAL_BLOCK_COMPOSITION_STATE);

    // Confirm callback should have been called
    expect(onCompositionConfirm).toHaveBeenCalledWith("b1", 5, "確定", 0);
  });
});

// =============================================================================
// Composition Display Utilities
// =============================================================================

describe("getCompositionEndPosition", () => {
  it("returns null when not composing", () => {
    const result = getCompositionEndPosition(INITIAL_BLOCK_COMPOSITION_STATE);
    expect(result).toBeNull();
  });

  it("returns end position during composition", () => {
    const state: BlockCompositionState = {
      isComposing: true,
      blockId: "b1" as BlockId,
      localOffset: 5,
      text: "あいう",
      replacedLength: 0,
    };
    const result = getCompositionEndPosition(state);
    expect(result).toEqual({
      blockId: "b1",
      offset: 8, // 5 + 3 characters
    });
  });
});

describe("isPositionInComposition", () => {
  const composingState: BlockCompositionState = {
    isComposing: true,
    blockId: "b1" as BlockId,
    localOffset: 5,
    text: "abc",
    replacedLength: 0,
  };

  it("returns false when not composing", () => {
    const result = isPositionInComposition(INITIAL_BLOCK_COMPOSITION_STATE, {
      blockId: "b1" as BlockId,
      offset: 5,
    });
    expect(result).toBe(false);
  });

  it("returns false for different block", () => {
    const result = isPositionInComposition(composingState, {
      blockId: "b2" as BlockId,
      offset: 5,
    });
    expect(result).toBe(false);
  });

  it("returns true for position within composition", () => {
    const result = isPositionInComposition(composingState, {
      blockId: "b1" as BlockId,
      offset: 6,
    });
    expect(result).toBe(true);
  });

  it("returns true for position at composition start", () => {
    const result = isPositionInComposition(composingState, {
      blockId: "b1" as BlockId,
      offset: 5,
    });
    expect(result).toBe(true);
  });

  it("returns true for position at composition end", () => {
    const result = isPositionInComposition(composingState, {
      blockId: "b1" as BlockId,
      offset: 8,
    });
    expect(result).toBe(true);
  });

  it("returns false for position before composition", () => {
    const result = isPositionInComposition(composingState, {
      blockId: "b1" as BlockId,
      offset: 4,
    });
    expect(result).toBe(false);
  });

  it("returns false for position after composition", () => {
    const result = isPositionInComposition(composingState, {
      blockId: "b1" as BlockId,
      offset: 9,
    });
    expect(result).toBe(false);
  });
});

describe("getCompositionRange", () => {
  it("returns null when not composing", () => {
    const result = getCompositionRange(INITIAL_BLOCK_COMPOSITION_STATE);
    expect(result).toBeNull();
  });

  it("returns range during composition", () => {
    const state: BlockCompositionState = {
      isComposing: true,
      blockId: "b1" as BlockId,
      localOffset: 5,
      text: "abc",
      replacedLength: 0,
    };
    const result = getCompositionRange(state);
    expect(result).toEqual({
      start: { blockId: "b1", offset: 5 },
      end: { blockId: "b1", offset: 8 },
    });
  });
});

// =============================================================================
// Block Content with Composition
// =============================================================================

describe("computeBlockDisplayContent", () => {
  it("returns original content when not composing", () => {
    const content = "Hello World";
    const result = computeBlockDisplayContent(
      content,
      INITIAL_BLOCK_COMPOSITION_STATE,
      "b1" as BlockId
    );
    expect(result).toBe(content);
  });

  it("returns original content when composing in different block", () => {
    const content = "Hello World";
    const state: BlockCompositionState = {
      isComposing: true,
      blockId: "b2" as BlockId,
      localOffset: 0,
      text: "test",
      replacedLength: 0,
    };
    const result = computeBlockDisplayContent(content, state, "b1" as BlockId);
    expect(result).toBe(content);
  });

  it("returns content when composing in same block", () => {
    const content = "Hello World";
    const state: BlockCompositionState = {
      isComposing: true,
      blockId: "b1" as BlockId,
      localOffset: 6,
      text: "test",
      replacedLength: 0,
    };
    const result = computeBlockDisplayContent(content, state, "b1" as BlockId);
    // Content is already updated by browser, we just return it
    expect(result).toBe(content);
  });
});

// =============================================================================
// Style Adjustment
// =============================================================================

describe("adjustBlockStyleForComposition", () => {
  const composingState: BlockCompositionState = {
    isComposing: true,
    blockId: "b1" as BlockId,
    localOffset: 5,
    text: "xyz", // 3 chars replacing 2 chars = +1 shift
    replacedLength: 2,
  };

  it("returns segment unchanged when not composing", () => {
    const segment = { start: 0, end: 5, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      INITIAL_BLOCK_COMPOSITION_STATE,
      "b1" as BlockId
    );
    expect(result).toBe(segment);
  });

  it("returns segment unchanged when composing in different block", () => {
    const segment = { start: 0, end: 5, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b2" as BlockId
    );
    expect(result).toBe(segment);
  });

  it("returns segment unchanged when entirely before composition", () => {
    const segment = { start: 0, end: 4, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b1" as BlockId
    );
    expect(result).toEqual(segment);
  });

  it("returns null for segment entirely inside composition", () => {
    const segment = { start: 5, end: 7, style: {} }; // Within composition range
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b1" as BlockId
    );
    expect(result).toBeNull();
  });

  it("shifts segment entirely after composition", () => {
    // Composition replaces 2 chars with 3, so +1 shift
    const segment = { start: 10, end: 15, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b1" as BlockId
    );
    expect(result).toEqual({ start: 11, end: 16, style: {} });
  });

  it("truncates segment overlapping composition start", () => {
    const segment = { start: 3, end: 6, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b1" as BlockId
    );
    expect(result).toEqual({ start: 3, end: 5, style: {} });
  });

  it("adjusts segment overlapping composition end", () => {
    const segment = { start: 6, end: 10, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b1" as BlockId
    );
    // compositionEnd = 5 + 2 = 7, new start = 5 + 3 = 8, shift = 3 - 2 = 1
    expect(result).toEqual({ start: 8, end: 11, style: {} });
  });

  it("truncates segment spanning entire composition", () => {
    const segment = { start: 3, end: 10, style: {} };
    const result = adjustBlockStyleForComposition(
      segment,
      composingState,
      "b1" as BlockId
    );
    expect(result).toEqual({ start: 3, end: 5, style: {} });
  });
});
