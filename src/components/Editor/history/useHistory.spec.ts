/**
 * @file useHistory Hook Tests
 *
 * Tests for the history management hook, including undo/redo and cursor position tracking.
 */

import { renderHook, act } from "@testing-library/react";
import { useHistory, type HistoryEntry } from "../history/useHistory";

// =============================================================================
// Test Setup
// =============================================================================

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// =============================================================================
// Basic Functionality Tests
// =============================================================================

describe("useHistory", () => {
  describe("initialization", () => {
    it("initializes with given state and cursor offset", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 5, { debounceMs: 300 })
      );

      expect(result.current.current).toBe("initial");
      expect(result.current.cursorOffset).toBe(5);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("push", () => {
    it("creates undo point on first push", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 5);
      });

      expect(result.current.current).toBe("modified");
      expect(result.current.cursorOffset).toBe(5);
      expect(result.current.canUndo).toBe(true);
    });

    it("batches rapid pushes within debounce window", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("a", 1);
        result.current.push("ab", 2);
        result.current.push("abc", 3);
      });

      expect(result.current.current).toBe("abc");
      expect(result.current.cursorOffset).toBe(3);

      // Should only create one undo point
      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      expect(refs.restored?.state).toBe("initial");
      expect(result.current.current).toBe("initial");
      expect(result.current.canUndo).toBe(false);
    });

    it("creates new undo point after debounce timeout", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("first", 5);
      });

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.push("second", 10);
      });

      // Should be able to undo twice
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("first");

      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("initial");
    });
  });

  describe("undo", () => {
    it("restores previous state with cursor offset", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 3, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 8);
      });

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      expect(refs.restored).toBeDefined();
      expect(refs.restored?.state).toBe("initial");
      expect(refs.restored?.cursorOffset).toBe(3);
      expect(result.current.current).toBe("initial");
      expect(result.current.cursorOffset).toBe(3);
    });

    it("returns undefined when nothing to undo", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      expect(refs.restored).toBeUndefined();
    });

    it("enables redo after undo", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 5);
      });

      expect(result.current.canRedo).toBe(false);

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);
    });
  });

  describe("redo", () => {
    it("restores undone state with cursor offset", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 8);
      });

      act(() => {
        result.current.undo();
      });

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.redo();
      });

      expect(refs.restored).toBeDefined();
      expect(refs.restored?.state).toBe("modified");
      expect(refs.restored?.cursorOffset).toBe(8);
      expect(result.current.current).toBe("modified");
    });

    it("returns undefined when nothing to redo", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.redo();
      });

      expect(refs.restored).toBeUndefined();
    });

    it("clears redo stack on new push", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("first", 5);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.undo();
      });
      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.push("new", 3);
      });
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("reset", () => {
    it("clears history and sets new initial state", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 5);
      });

      act(() => {
        result.current.reset("new initial", 10);
      });

      expect(result.current.current).toBe("new initial");
      expect(result.current.cursorOffset).toBe(10);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  // =============================================================================
  // Stale Closure Bug Fix Tests
  // =============================================================================

  describe("stale closure prevention", () => {
    it("returns correct entry when undo called immediately after push", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      // Simulate paste scenario: push then immediate undo
      // In real usage, these are separate keyboard events
      act(() => {
        result.current.push("pasted content", 15);
      });

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        // Called immediately after push (before debounce completes)
        refs.restored = result.current.undo();
      });

      // Should return the correct previous state
      expect(refs.restored).toBeDefined();
      expect(refs.restored?.state).toBe("initial");
      expect(refs.restored?.cursorOffset).toBe(0);
      expect(result.current.current).toBe("initial");
    });

    it("returns correct entry when redo called immediately after undo", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 8);
      });

      act(() => {
        result.current.undo();
      });

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        // Immediately redo after undo
        refs.restored = result.current.redo();
      });

      expect(refs.restored).toBeDefined();
      expect(refs.restored?.state).toBe("modified");
      expect(refs.restored?.cursorOffset).toBe(8);
    });

    it("handles multiple rapid push-undo cycles correctly", () => {
      const { result } = renderHook(() =>
        useHistory("A", 1, { debounceMs: 300 })
      );

      // First edit cycle
      act(() => {
        result.current.push("AB", 2);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Second edit cycle
      act(() => {
        result.current.push("ABC", 3);
      });

      // Immediate undo (before debounce)
      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      // Should undo to "AB", not to "A"
      expect(refs.restored?.state).toBe("AB");
      expect(refs.restored?.cursorOffset).toBe(2);
      expect(result.current.current).toBe("AB");
    });

    it("preserves cursor position through rapid operations", () => {
      const { result } = renderHook(() =>
        useHistory("HELLO", 5, { debounceMs: 300 })
      );

      // Simulate typing at position 5
      act(() => {
        result.current.push("HELLO!", 6);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Paste "XYZ" at position 3
      act(() => {
        result.current.push("HELXYZLO!", 6);
      });

      // Immediate undo
      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      // Should restore to "HELLO!" with cursor at 6
      expect(refs.restored?.state).toBe("HELLO!");
      expect(refs.restored?.cursorOffset).toBe(6);
    });
  });

  // =============================================================================
  // Max History Tests
  // =============================================================================

  describe("max history limit", () => {
    it("trims history when exceeding max", () => {
      const { result } = renderHook(() =>
        useHistory("0", 0, { debounceMs: 300, maxHistory: 3 })
      );

      // Create 5 undo points
      for (let i = 1; i <= 5; i++) {
        act(() => {
          result.current.push(String(i), i);
        });
        act(() => {
          vi.advanceTimersByTime(300);
        });
      }

      // Should only be able to undo 3 times (max history)
      const countUndoOperations = (): number => {
        const refs = { count: 0 };
        while (result.current.canUndo) {
          act(() => {
            result.current.undo();
          });
          refs.count++;
        }
        return refs.count;
      };

      expect(countUndoOperations()).toBe(3);
    });
  });

  // =============================================================================
  // Flush Tests
  // =============================================================================

  describe("flush", () => {
    it("resets batch state allowing next push to create new undo point", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      // Start first batch
      act(() => {
        result.current.push("first", 5);
      });

      // Flush before debounce completes
      act(() => {
        result.current.flush();
      });

      // Push again - should create new undo point
      act(() => {
        result.current.push("second", 10);
      });

      // Should be able to undo twice
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("first");

      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("initial");
    });

    it("clears pending debounce timer", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 5);
      });

      // Flush immediately
      act(() => {
        result.current.flush();
      });

      // Advance time past debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Push again - should create new undo point
      act(() => {
        result.current.push("another", 7);
      });

      // Undo should go to "modified", not "initial"
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("modified");
    });

    it("is safe to call multiple times", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("modified", 5);
      });

      // Call flush multiple times
      act(() => {
        result.current.flush();
        result.current.flush();
        result.current.flush();
      });

      expect(result.current.current).toBe("modified");
      expect(result.current.canUndo).toBe(true);
    });
  });

  // =============================================================================
  // Boundary Condition Tests
  // =============================================================================

  describe("boundary conditions", () => {
    it("handles maxHistory of 1", () => {
      const { result } = renderHook(() =>
        useHistory("initial", 0, { debounceMs: 300, maxHistory: 1 })
      );

      act(() => {
        result.current.push("first", 5);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.push("second", 10);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only be able to undo once
      act(() => {
        result.current.undo();
      });
      expect(result.current.canUndo).toBe(false);
    });

    it("handles empty string state", () => {
      const { result } = renderHook(() =>
        useHistory("", 0, { debounceMs: 300 })
      );

      act(() => {
        result.current.push("content", 7);
      });

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      expect(refs.restored?.state).toBe("");
      expect(refs.restored?.cursorOffset).toBe(0);
    });

    it("handles cursor offset at boundaries", () => {
      const { result } = renderHook(() =>
        useHistory("test", 0, { debounceMs: 300 })
      );

      // Push with cursor at end
      act(() => {
        result.current.push("test!", 5);
      });

      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });

      expect(refs.restored?.state).toBe("test");
      expect(refs.restored?.cursorOffset).toBe(0);
    });
  });

  // =============================================================================
  // Complex Undo/Redo Sequence Tests
  // =============================================================================

  describe("complex undo/redo sequences", () => {
    it("handles alternating undo/redo correctly", () => {
      const { result } = renderHook(() =>
        useHistory("A", 1, { debounceMs: 300 })
      );

      // Create history: A -> B -> C
      act(() => {
        result.current.push("B", 2);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.push("C", 3);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Undo: C -> B
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("B");

      // Redo: B -> C
      act(() => {
        result.current.redo();
      });
      expect(result.current.current).toBe("C");

      // Undo again: C -> B
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("B");

      // Undo again: B -> A
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("A");

      // Redo: A -> B
      act(() => {
        result.current.redo();
      });
      expect(result.current.current).toBe("B");
    });

    it("clears redo stack on new push after undo", () => {
      const { result } = renderHook(() =>
        useHistory("A", 1, { debounceMs: 300 })
      );

      // Create history: A -> B -> C
      act(() => {
        result.current.push("B", 2);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.push("C", 3);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Undo twice: C -> B -> A
      act(() => {
        result.current.undo();
      });
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("A");
      expect(result.current.canRedo).toBe(true);

      // Push new state - should clear redo
      act(() => {
        result.current.push("D", 4);
      });
      expect(result.current.canRedo).toBe(false);

      // Can undo to A
      act(() => {
        result.current.undo();
      });
      expect(result.current.current).toBe("A");
    });

    it("preserves cursor offset through undo/redo cycle", () => {
      const { result } = renderHook(() =>
        useHistory("start", 5, { debounceMs: 300 })
      );

      // Edit at different positions
      act(() => {
        result.current.push("start!", 6);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.push("start!!", 7);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Undo and check cursor
      const refs = { restored: undefined as HistoryEntry<string> | undefined };
      act(() => {
        refs.restored = result.current.undo();
      });
      expect(refs.restored?.cursorOffset).toBe(6);

      // Redo and check cursor
      act(() => {
        refs.restored = result.current.redo();
      });
      expect(refs.restored?.cursorOffset).toBe(7);
    });
  });
});
