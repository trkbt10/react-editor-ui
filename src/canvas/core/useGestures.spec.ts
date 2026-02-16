/**
 * @file Tests for useGestures hook utilities
 */
import { shouldPan, zoomToPoint } from "./useGestures";
import type { GestureConfig, ViewportState } from "./types";
import { DEFAULT_GESTURE_CONFIG } from "./types";
import type { PointerEvent } from "react";

describe("shouldPan", () => {
  const createMockEvent = (overrides: Partial<PointerEvent<HTMLDivElement>> = {}) =>
    ({
      button: 0,
      altKey: false,
      pointerType: "mouse",
      ...overrides,
    }) as PointerEvent<HTMLDivElement>;

  it("returns false when pan is disabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panEnabled: false };
    const event = createMockEvent({ button: 1 });
    expect(shouldPan(event, config, false)).toBe(false);
  });

  it("returns true for middle mouse button when middle trigger is enabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["middle"] };
    const event = createMockEvent({ button: 1 });
    expect(shouldPan(event, config, false)).toBe(true);
  });

  it("returns false for middle mouse button when middle trigger is disabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["alt", "space"] };
    const event = createMockEvent({ button: 1 });
    expect(shouldPan(event, config, false)).toBe(false);
  });

  it("returns true for alt + left click when alt trigger is enabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["alt"] };
    const event = createMockEvent({ button: 0, altKey: true });
    expect(shouldPan(event, config, false)).toBe(true);
  });

  it("returns false for alt + left click when alt trigger is disabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["middle", "space"] };
    const event = createMockEvent({ button: 0, altKey: true });
    expect(shouldPan(event, config, false)).toBe(false);
  });

  it("returns true for space + left click when space trigger is enabled and space is pressed", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["space"] };
    const event = createMockEvent({ button: 0 });
    expect(shouldPan(event, config, true)).toBe(true);
  });

  it("returns false for left click when space is not pressed", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["space"] };
    const event = createMockEvent({ button: 0 });
    expect(shouldPan(event, config, false)).toBe(false);
  });

  it("returns false for left click with no modifiers", () => {
    const config: GestureConfig = DEFAULT_GESTURE_CONFIG;
    const event = createMockEvent({ button: 0 });
    expect(shouldPan(event, config, false)).toBe(false);
  });

  it("returns true for touch when touch trigger is enabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["touch"] };
    const event = createMockEvent({ button: 0, pointerType: "touch" });
    expect(shouldPan(event, config, false)).toBe(true);
  });

  it("returns false for touch when touch trigger is disabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["middle", "alt", "space"] };
    const event = createMockEvent({ button: 0, pointerType: "touch" });
    expect(shouldPan(event, config, false)).toBe(false);
  });

  it("returns false for mouse when only touch trigger is enabled", () => {
    const config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, panTriggers: ["touch"] };
    const event = createMockEvent({ button: 0, pointerType: "mouse" });
    expect(shouldPan(event, config, false)).toBe(false);
  });
});

describe("zoomToPoint", () => {
  it("keeps the point under cursor fixed during zoom in", () => {
    const viewport: ViewportState = { x: 0, y: 0, scale: 1 };
    const cursorX = 100;
    const cursorY = 100;
    const newScale = 2;

    const result = zoomToPoint(viewport, cursorX, cursorY, newScale);

    // At cursor position, canvas coords should be:
    // Before: cursorX / oldScale + viewport.x = 100 / 1 + 0 = 100
    // After:  cursorX / newScale + result.x = 100 / 2 + result.x
    // These should be equal, so result.x = 100 - 50 = 50
    expect(result.scale).toBe(2);
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });

  it("keeps the point under cursor fixed during zoom out", () => {
    const viewport: ViewportState = { x: 50, y: 50, scale: 2 };
    const cursorX = 100;
    const cursorY = 100;
    const newScale = 1;

    const result = zoomToPoint(viewport, cursorX, cursorY, newScale);

    // Before: 100 / 2 + 50 = 100 (canvas coords)
    // After:  100 / 1 + result.x = 100
    // result.x = 0
    expect(result.scale).toBe(1);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it("handles zoom at origin", () => {
    const viewport: ViewportState = { x: 0, y: 0, scale: 1 };
    const cursorX = 0;
    const cursorY = 0;
    const newScale = 2;

    const result = zoomToPoint(viewport, cursorX, cursorY, newScale);

    expect(result.scale).toBe(2);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it("handles zoom with existing pan offset", () => {
    const viewport: ViewportState = { x: 100, y: 100, scale: 1 };
    const cursorX = 200;
    const cursorY = 200;
    const newScale = 2;

    const result = zoomToPoint(viewport, cursorX, cursorY, newScale);

    // Before: 200 / 1 + 100 = 300 (canvas coords)
    // After:  200 / 2 + result.x = 300
    // result.x = 200
    expect(result.scale).toBe(2);
    expect(result.x).toBe(200);
    expect(result.y).toBe(200);
  });
});
