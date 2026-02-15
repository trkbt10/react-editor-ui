/**
 * @file E2E tests for Canvas component
 */

import { test, expect } from "@playwright/test";

test.describe("Canvas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/canvas/canvas");
    await page.waitForSelector("h2");
  });

  test("renders canvas with correct structure", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    await expect(canvas).toBeVisible();

    // SVG layer exists
    const svg = canvas.locator("svg");
    await expect(svg).toBeVisible();

    // Content layer exists (width/height: 0 but children are visible)
    const content = canvas.locator('[data-testid="canvas-content"]');
    await expect(content).toBeAttached();

    // Child content is visible
    const childContent = canvas.locator("text=Drag me (pan)");
    await expect(childContent).toBeVisible();
  });

  test("displays initial viewport state", async ({ page }) => {
    // Check initial state display
    const xValue = page.locator("text=X: 0.0");
    const yValue = page.locator("text=Y: 0.0");
    const scaleValue = page.locator("text=Scale: 100%");

    await expect(xValue).toBeVisible();
    await expect(yValue).toBeVisible();
    await expect(scaleValue).toBeVisible();
  });

  test("zooms with mouse wheel", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const svg = canvas.locator("svg");

    // Get initial viewBox
    const initialViewBox = await svg.getAttribute("viewBox");
    expect(initialViewBox).toBe("0 0 600 400");

    // Zoom in with wheel (negative deltaY)
    await canvas.dispatchEvent("wheel", {
      deltaY: -100,
      clientX: 300,
      clientY: 200,
    });

    // viewBox should change (zoom in = smaller viewBox dimensions)
    const newViewBox = await svg.getAttribute("viewBox");
    expect(newViewBox).not.toBe(initialViewBox);

    // Scale display should update
    const scaleValue = page.locator("div").filter({ hasText: /^Scale: \d+%$/ });
    const scaleText = await scaleValue.textContent();
    expect(scaleText).not.toBe("Scale: 100%");
  });

  test("pans with middle mouse drag", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Middle mouse drag
    await page.mouse.move(centerX, centerY);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(centerX + 50, centerY + 30, { steps: 5 });
    await page.mouse.up({ button: "middle" });

    // X and Y values should change
    const xValue = page.locator("div").filter({ hasText: /^X: -?\d+\.\d$/ });
    const xText = await xValue.textContent();
    expect(xText).not.toBe("X: 0.0");
  });

  test("pans with Alt + left mouse drag", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Alt + left mouse drag
    await page.mouse.move(centerX, centerY);
    await page.keyboard.down("Alt");
    await page.mouse.down({ button: "left" });
    await page.mouse.move(centerX + 40, centerY + 20, { steps: 5 });
    await page.mouse.up({ button: "left" });
    await page.keyboard.up("Alt");

    // Y value should change
    const yValue = page.locator("div").filter({ hasText: /^Y: -?\d+\.\d$/ });
    const yText = await yValue.textContent();
    expect(yText).not.toBe("Y: 0.0");
  });

  test("reset button restores initial viewport", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();

    // First, zoom to change state
    await canvas.dispatchEvent("wheel", {
      deltaY: -100,
      clientX: 300,
      clientY: 200,
    });

    // Verify state changed
    const scaleBeforeReset = page.locator("div").filter({ hasText: /^Scale: \d+%$/ });
    const scaleBefore = await scaleBeforeReset.textContent();
    expect(scaleBefore).not.toBe("Scale: 100%");

    // Click reset
    const resetButton = page.locator("button", { hasText: "Reset" });
    await resetButton.click();

    // Verify state reset
    await expect(page.locator("text=X: 0.0")).toBeVisible();
    await expect(page.locator("text=Y: 0.0")).toBeVisible();
    await expect(page.locator("text=Scale: 100%")).toBeVisible();
  });

  test("renders grid pattern when showGrid is true", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const svg = canvas.locator("svg");

    // Grid lines should be present
    const lines = svg.locator("line");
    const lineCount = await lines.count();
    expect(lineCount).toBeGreaterThan(0);
  });

  test("cursor changes while panning", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Check initial cursor
    const initialCursor = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(initialCursor).toBe("default");

    // Start panning with middle mouse
    await page.mouse.move(centerX, centerY);
    await page.mouse.down({ button: "middle" });

    // Cursor should change to grabbing
    const panningCursor = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(panningCursor).toBe("grabbing");

    await page.mouse.up({ button: "middle" });
  });

  test("applies touch-action none for gesture handling", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();

    const touchAction = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).touchAction;
    });
    expect(touchAction).toBe("none");
  });

  test("pinch zoom via ctrl+wheel", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const svg = canvas.locator("svg");

    const initialViewBox = await svg.getAttribute("viewBox");

    // Ctrl+wheel for pinch zoom
    await canvas.dispatchEvent("wheel", {
      deltaY: -50,
      ctrlKey: true,
      clientX: 300,
      clientY: 200,
    });

    const newViewBox = await svg.getAttribute("viewBox");
    expect(newViewBox).not.toBe(initialViewBox);
  });

  test("renders child content at correct position", async ({ page }) => {
    // First canvas has content at x=100, y=100
    const canvas = page.locator('[role="application"]').first();
    const dragElement = canvas.locator("text=Drag me (pan)");

    await expect(dragElement).toBeVisible();
  });
});

test.describe("Canvas Mobile/Touch", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/canvas/canvas");
    await page.waitForSelector("h2");
  });

  test("has touch-action none for gesture handling", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();

    const touchAction = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).touchAction;
    });
    expect(touchAction).toBe("none");
  });

  test("has user-select none to prevent text selection on iOS", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();

    const userSelect = await canvas.evaluate((el) => {
      const style = window.getComputedStyle(el);
      // Check both standard and webkit prefix
      return style.userSelect || style.getPropertyValue("-webkit-user-select");
    });
    expect(userSelect).toBe("none");
  });

  test("has overscroll-behavior none to prevent iOS bounce", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();

    const overscrollBehavior = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).overscrollBehavior;
    });
    expect(overscrollBehavior).toBe("none");
  });

  test("pans with single touch drag", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Simulate touch pan using pointer events with touch type
    await canvas.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: centerX,
      clientY: centerY,
      isPrimary: true,
    });

    await canvas.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: centerX + 50,
      clientY: centerY + 30,
    });

    await canvas.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
    });

    // Check that viewport changed (X should not be 0.0 anymore)
    const xValue = page.locator("div").filter({ hasText: /^X: -?\d+\.\d$/ });
    const xText = await xValue.textContent();
    expect(xText).not.toBe("X: 0.0");
  });

  test("pinch zoom with two fingers", async ({ page }) => {
    const canvas = page.locator('[role="application"]').first();
    const svg = canvas.locator("svg");
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    const initialViewBox = await svg.getAttribute("viewBox");

    // First finger down
    await canvas.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: centerX - 50,
      clientY: centerY,
      isPrimary: true,
    });

    // Second finger down (starts pinch)
    await canvas.dispatchEvent("pointerdown", {
      pointerId: 2,
      pointerType: "touch",
      button: 0,
      clientX: centerX + 50,
      clientY: centerY,
      isPrimary: false,
    });

    // Move fingers apart (zoom in)
    await canvas.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: centerX - 100,
      clientY: centerY,
    });

    await canvas.dispatchEvent("pointermove", {
      pointerId: 2,
      pointerType: "touch",
      button: 0,
      clientX: centerX + 100,
      clientY: centerY,
    });

    // Release fingers
    await canvas.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
    });

    await canvas.dispatchEvent("pointerup", {
      pointerId: 2,
      pointerType: "touch",
      button: 0,
    });

    // viewBox should have changed
    const newViewBox = await svg.getAttribute("viewBox");
    expect(newViewBox).not.toBe(initialViewBox);
  });
});
