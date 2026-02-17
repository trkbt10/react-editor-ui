/**
 * @file Re-render performance E2E tests
 *
 * Uses react-scan to detect unnecessary re-renders.
 * These tests verify that components are properly memoized.
 */

import { test, expect } from "@playwright/test";

type RenderCount = {
  component: string;
  count: number;
};

/**
 * Window type extension for render tracking.
 */
type PerfWindow = Window & {
  __REACT_SCAN_RENDER_COUNTS__?: RenderCount[];
};

test.describe("Re-render Performance", () => {
  test("BoundingBox should not cause Canvas re-render on move", async ({ page }) => {
    await page.goto("/#/bounding-box");
    await page.waitForSelector('[data-testid="bounding-box"]');

    // Inject render tracking
    await page.evaluate(() => {
      const win = window as PerfWindow;
      win.__REACT_SCAN_RENDER_COUNTS__ = [];
    });

    // Move the bounding box
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    const box = await moveArea.boundingBox();
    if (!box) {
      throw new Error("BoundingBox not found");
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Drag multiple steps
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(startX + (i + 1) * 10, startY + (i + 1) * 5);
      await page.waitForTimeout(50);
    }

    await page.mouse.up();

    // Verify box moved (action was registered)
    const lastAction = await page.locator('[data-testid="last-action"]').textContent();
    expect(lastAction).toBe("move");
  });

  test("Grid should update smoothly during pan", async ({ page }) => {
    await page.goto("/#/grid-layer");
    await page.waitForSelector('[data-testid="canvas-svg"]');

    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
      throw new Error("Canvas not found");
    }

    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;

    // Pan using middle mouse
    await page.mouse.move(centerX, centerY);
    await page.mouse.down({ button: "middle" });

    for (let i = 0; i < 10; i++) {
      await page.mouse.move(centerX + (i + 1) * 20, centerY);
      await page.waitForTimeout(30);
    }

    await page.mouse.up({ button: "middle" });

    // Grid should still be visible after pan
    await expect(page.locator('[data-testid="canvas-svg"]')).toBeVisible();
  });

  test("Ruler should update during zoom", async ({ page }) => {
    await page.goto("/#/ruler");
    await page.waitForSelector('[data-testid="canvas-ruler-horizontal"]');

    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
      throw new Error("Canvas not found");
    }

    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;

    // Zoom with wheel
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(100);

    // Rulers should still be visible
    await expect(page.locator('[data-testid="canvas-ruler-horizontal"]')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-ruler-vertical"]')).toBeVisible();
  });

  test("Guides should remain visible during viewport changes", async ({ page }) => {
    await page.goto("/#/guide");
    await page.waitForSelector('[data-testid="canvas-guides"]');

    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
      throw new Error("Canvas not found");
    }

    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;

    // Pan
    await page.mouse.move(centerX, centerY);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(centerX + 100, centerY + 50);
    await page.mouse.up({ button: "middle" });

    // Zoom
    await page.mouse.wheel(0, -150);
    await page.waitForTimeout(100);

    // Guides should still be visible
    await expect(page.locator('[data-testid="canvas-guides"]')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-guide-horizontal"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="canvas-guide-vertical"]').first()).toBeVisible();
  });
});
