/**
 * @file E2E tests for BoundingBox component
 *
 * Tests the interactive bounding box for canvas object selection,
 * including move, resize, and rotate interactions.
 */

import { test, expect } from "@playwright/test";

test.describe("BoundingBox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/canvas/bounding-box");
    await page.waitForSelector("h2");
    // Wait for the Interactive Bounding Box section to be visible
    await page.waitForSelector('text="Interactive BoundingBox"');
  });

  test("renders bounding box with correct structure", async ({ page }) => {
    // Get the first (interactive) bounding box
    const boundingBox = page.locator('[data-testid="bounding-box"]').first();
    await expect(boundingBox).toBeVisible();

    // Border rect exists
    const border = boundingBox.locator('[data-testid="bounding-box-border"]');
    await expect(border).toBeVisible();

    // Corner handles exist
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-top-left"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-top-right"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-bottom-left"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-bottom-right"]')).toBeVisible();

    // Edge handles exist
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-top"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-right"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-bottom"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-handle-left"]')).toBeVisible();

    // Rotation zones exist at corners
    await expect(boundingBox.locator('[data-testid="bounding-box-rotation-zone-top-left"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-rotation-zone-top-right"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-rotation-zone-bottom-left"]')).toBeVisible();
    await expect(boundingBox.locator('[data-testid="bounding-box-rotation-zone-bottom-right"]')).toBeVisible();

    // Size label exists
    const label = boundingBox.locator('[data-testid="bounding-box-label"]');
    await expect(label).toBeVisible();
  });

  test("displays initial transform state", async ({ page }) => {
    // Check initial state display in the panel
    await expect(page.locator("text=X: 100.0")).toBeVisible();
    await expect(page.locator("text=Y: 100.0")).toBeVisible();
    await expect(page.locator("text=Width: 200.0")).toBeVisible();
    await expect(page.locator("text=Height: 150.0")).toBeVisible();
    await expect(page.locator("text=Rotation: 0.0°")).toBeVisible();
  });

  test("moves box with mouse drag on border", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]').first();
    const box = await moveArea.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Drag to move using pointer events
    await moveArea.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: centerX,
      clientY: centerY,
      isPrimary: true,
    });

    await moveArea.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: centerX + 50,
      clientY: centerY + 30,
    });

    await moveArea.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });

    // X and Y values should change
    const xText = await page.locator("div").filter({ hasText: /^X: \d+\.\d$/ }).textContent();
    const yText = await page.locator("div").filter({ hasText: /^Y: \d+\.\d$/ }).textContent();

    expect(xText).not.toBe("X: 100.0");
    expect(yText).not.toBe("Y: 100.0");
  });

  test("resizes box with corner handle drag", async ({ page }) => {
    const handle = page.locator('[data-testid="bounding-box-handle-bottom-right"]').first();
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const handleCenterX = handleBox!.x + handleBox!.width / 2;
    const handleCenterY = handleBox!.y + handleBox!.height / 2;

    // Drag handle to resize using pointer events
    await handle.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: handleCenterX,
      clientY: handleCenterY,
      isPrimary: true,
    });

    await handle.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: handleCenterX + 40,
      clientY: handleCenterY + 30,
    });

    await handle.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });

    // Width and Height should change
    const widthText = await page.locator("div").filter({ hasText: /^Width: \d+\.\d$/ }).textContent();
    const heightText = await page.locator("div").filter({ hasText: /^Height: \d+\.\d$/ }).textContent();

    expect(widthText).not.toBe("Width: 200.0");
    expect(heightText).not.toBe("Height: 150.0");
  });

  test("resizes box with edge handle drag", async ({ page }) => {
    const handle = page.locator('[data-testid="bounding-box-handle-right"]').first();
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const handleCenterX = handleBox!.x + handleBox!.width / 2;
    const handleCenterY = handleBox!.y + handleBox!.height / 2;

    // Drag handle to resize (only width should change)
    await handle.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: handleCenterX,
      clientY: handleCenterY,
      isPrimary: true,
    });

    await handle.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: handleCenterX + 50,
      clientY: handleCenterY,
    });

    await handle.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });

    // Width should change
    const widthText = await page.locator("div").filter({ hasText: /^Width: \d+\.\d$/ }).textContent();
    expect(widthText).not.toBe("Width: 200.0");

    // Height should remain the same
    await expect(page.locator("text=Height: 150.0")).toBeVisible();
  });

  test("rotates box with rotation zone drag", async ({ page }) => {
    const rotationZone = page.locator('[data-testid="bounding-box-rotation-zone-top-left"]').first();
    const zoneBox = await rotationZone.boundingBox();
    expect(zoneBox).not.toBeNull();

    const zoneCenterX = zoneBox!.x + zoneBox!.width / 2;
    const zoneCenterY = zoneBox!.y + zoneBox!.height / 2;

    // Drag rotation zone using pointer events
    await rotationZone.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: zoneCenterX,
      clientY: zoneCenterY,
      isPrimary: true,
    });

    await rotationZone.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: zoneCenterX + 100,
      clientY: zoneCenterY + 50,
    });

    await rotationZone.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });

    // Rotation should change from 0
    const rotationText = await page.locator("div").filter({ hasText: /^Rotation: -?\d+\.\d°$/ }).textContent();
    expect(rotationText).not.toBe("Rotation: 0.0°");
  });

  test("reset button restores initial transform", async ({ page }) => {
    // First, move the box to change state
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]').first();
    const box = await moveArea.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Move using pointer events
    await moveArea.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: centerX,
      clientY: centerY,
      isPrimary: true,
    });

    await moveArea.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: centerX + 50,
      clientY: centerY + 30,
    });

    await moveArea.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });

    // Verify state changed
    const xBefore = await page.locator("div").filter({ hasText: /^X: \d+\.\d$/ }).textContent();
    expect(xBefore).not.toBe("X: 100.0");

    // Click reset button (the first one on this page)
    const resetButton = page.locator("button", { hasText: "Reset" }).first();
    await resetButton.click();

    // Verify state reset
    await expect(page.locator("text=X: 100.0")).toBeVisible();
    await expect(page.locator("text=Y: 100.0")).toBeVisible();
    await expect(page.locator("text=Width: 200.0")).toBeVisible();
    await expect(page.locator("text=Height: 150.0")).toBeVisible();
    await expect(page.locator("text=Rotation: 0.0°")).toBeVisible();
  });

  test("logs interaction events", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]').first();
    const box = await moveArea.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Drag to move using pointer events
    await moveArea.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: centerX,
      clientY: centerY,
      isPrimary: true,
    });

    await moveArea.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: centerX + 10,
      clientY: centerY + 10,
    });

    await moveArea.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    });

    // Event log should show move events
    await expect(page.locator("text=Move started")).toBeVisible();
    await expect(page.locator("text=Move ended")).toBeVisible();
  });

  test("handles have correct cursors", async ({ page }) => {
    // Corner handles should have nwse/nesw resize cursors
    const topLeftHandle = page.locator('[data-testid="bounding-box-handle-top-left"]').first();
    const topLeftCursor = await topLeftHandle.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(topLeftCursor).toBe("nwse-resize");

    const topRightHandle = page.locator('[data-testid="bounding-box-handle-top-right"]').first();
    const topRightCursor = await topRightHandle.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(topRightCursor).toBe("nesw-resize");

    // Edge handles should have ns/ew resize cursors
    const topHandle = page.locator('[data-testid="bounding-box-handle-top"]').first();
    const topCursor = await topHandle.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(topCursor).toBe("ns-resize");

    const rightHandle = page.locator('[data-testid="bounding-box-handle-right"]').first();
    const rightCursor = await rightHandle.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(rightCursor).toBe("ew-resize");

    // Rotation zone should have custom rotation cursor (fallback to crosshair)
    const rotationZone = page.locator('[data-testid="bounding-box-rotation-zone-top-left"]').first();
    const rotationCursor = await rotationZone.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    // Custom cursor uses url() with crosshair fallback
    expect(rotationCursor).toContain("crosshair");

    // Move area should have move cursor
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]').first();
    const moveCursor = await moveArea.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(moveCursor).toBe("move");
  });

  test("handles scale consistently when canvas zooms", async ({ page }) => {
    // Get initial handle size
    const handle = page.locator('[data-testid="bounding-box-handle-top-left"]').first();
    const initialBox = await handle.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialWidth = initialBox!.width;

    // Zoom canvas (the second canvas in the page has the bounding box)
    const canvas = page.locator('[role="application"]').nth(1);
    await canvas.dispatchEvent("wheel", {
      deltaY: -200, // Zoom in
      clientX: 300,
      clientY: 200,
    });

    await page.waitForTimeout(100);

    // Handle should have similar screen size despite zoom
    const zoomedBox = await handle.boundingBox();
    expect(zoomedBox).not.toBeNull();

    // The handle size should remain roughly consistent (within tolerance)
    // because it's scaled inversely to viewport
    const sizeDiff = Math.abs(zoomedBox!.width - initialWidth);
    expect(sizeDiff).toBeLessThan(2); // Allow small tolerance
  });
});

test.describe("BoundingBox Touch", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/canvas/bounding-box");
    await page.waitForSelector("h2");
    await page.waitForSelector('text="Interactive BoundingBox"');
  });

  test("moves box with touch drag", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]').first();
    const box = await moveArea.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Simulate touch drag using pointer events with touch type
    await moveArea.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: centerX,
      clientY: centerY,
      isPrimary: true,
    });

    await moveArea.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: centerX + 50,
      clientY: centerY + 30,
    });

    await moveArea.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
    });

    // X and Y values should change
    const xText = await page.locator("div").filter({ hasText: /^X: \d+\.\d$/ }).textContent();
    expect(xText).not.toBe("X: 100.0");
  });

  test("resizes box with touch drag on handle", async ({ page }) => {
    const handle = page.locator('[data-testid="bounding-box-handle-bottom-right"]').first();
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const handleCenterX = handleBox!.x + handleBox!.width / 2;
    const handleCenterY = handleBox!.y + handleBox!.height / 2;

    // Simulate touch drag on handle
    await handle.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: handleCenterX,
      clientY: handleCenterY,
      isPrimary: true,
    });

    await handle.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: handleCenterX + 40,
      clientY: handleCenterY + 30,
    });

    await handle.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
    });

    // Width should change
    const widthText = await page.locator("div").filter({ hasText: /^Width: \d+\.\d$/ }).textContent();
    expect(widthText).not.toBe("Width: 200.0");
  });

  test("rotates box with touch drag on rotation zone", async ({ page }) => {
    const rotationZone = page.locator('[data-testid="bounding-box-rotation-zone-top-left"]').first();
    const zoneBox = await rotationZone.boundingBox();
    expect(zoneBox).not.toBeNull();

    const zoneCenterX = zoneBox!.x + zoneBox!.width / 2;
    const zoneCenterY = zoneBox!.y + zoneBox!.height / 2;

    // Simulate touch drag on rotation zone
    await rotationZone.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: zoneCenterX,
      clientY: zoneCenterY,
      isPrimary: true,
    });

    await rotationZone.dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: zoneCenterX + 100,
      clientY: zoneCenterY + 50,
    });

    await rotationZone.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      button: 0,
    });

    // Rotation should change
    const rotationText = await page.locator("div").filter({ hasText: /^Rotation: -?\d+\.\d°$/ }).textContent();
    expect(rotationText).not.toBe("Rotation: 0.0°");
  });
});
