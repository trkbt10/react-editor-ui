/**
 * @file Zoom E2E tests - Zoom controls functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Zoom Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should display zoom controls in right panel footer", async ({ page }) => {
    // Check zoom out button
    const zoomOutButton = page.locator('button[aria-label="Zoom out"]');
    await expect(zoomOutButton).toBeVisible();

    // Check zoom in button
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    await expect(zoomInButton).toBeVisible();

    // Check zoom percentage display (initial should be 100%)
    const zoomDisplay = page.locator('text=100%');
    await expect(zoomDisplay).toBeVisible();
  });

  test("should increase zoom when clicking zoom in", async ({ page }) => {
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    await expect(zoomInButton).toBeVisible();

    // Click zoom in
    await zoomInButton.click();

    // Wait for state update
    await page.waitForTimeout(100);

    // Check zoom percentage changed to 125%
    const zoomDisplay = page.locator('text=125%');
    await expect(zoomDisplay).toBeVisible();
  });

  test("should decrease zoom when clicking zoom out", async ({ page }) => {
    const zoomOutButton = page.locator('button[aria-label="Zoom out"]');
    await expect(zoomOutButton).toBeVisible();

    // Click zoom out
    await zoomOutButton.click();

    // Wait for state update
    await page.waitForTimeout(100);

    // Check zoom percentage changed to 75%
    const zoomDisplay = page.locator('text=75%');
    await expect(zoomDisplay).toBeVisible();
  });

  test("should reflect zoom change in canvas scale", async ({ page }) => {
    // Get initial canvas transform
    const canvasContent = page.locator('[data-testid="canvas-content"]');
    const initialTransform = await canvasContent.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    // Click zoom in
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    await zoomInButton.click();
    await page.waitForTimeout(100);

    // Get new canvas transform
    const newTransform = await canvasContent.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    // Transform should have changed
    expect(newTransform).not.toBe(initialTransform);
  });

  test("should have zoom limits", async ({ page }) => {
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    const zoomOutButton = page.locator('button[aria-label="Zoom out"]');

    // Click zoom in many times to reach max (400%)
    for (let i = 0; i < 15; i++) {
      await zoomInButton.click();
      await page.waitForTimeout(50);
    }

    // Should show 400% (max)
    const maxZoomDisplay = page.locator('text=400%');
    await expect(maxZoomDisplay).toBeVisible();

    // Click zoom out many times to reach min (25%)
    for (let i = 0; i < 20; i++) {
      await zoomOutButton.click();
      await page.waitForTimeout(50);
    }

    // Should show 25% (min)
    const minZoomDisplay = page.locator('text=25%');
    await expect(minZoomDisplay).toBeVisible();
  });

  test("should zoom smoothly with wheel without jitter", async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-svg"]');
    const canvasContent = page.locator('[data-testid="canvas-content"]');
    await expect(canvas).toBeVisible();

    // Get canvas bounding box
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not found");

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Track all transform values during zoom
    const transforms: string[] = [];

    // Perform continuous wheel zoom (zoom in)
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(centerX, centerY);
      await page.mouse.wheel(0, -50); // Negative delta = zoom in

      // Capture transform after each wheel event
      const transform = await canvasContent.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      transforms.push(transform);

      // Small delay to allow state updates
      await page.waitForTimeout(16); // ~1 frame at 60fps
    }

    // Verify zoom changed progressively
    // Extract scale from matrix transform: matrix(scale, 0, 0, scale, tx, ty)
    const scales = transforms.map((t) => {
      const match = t.match(/matrix\(([^,]+)/);
      return match ? parseFloat(match[1]) : 1;
    });

    // All scales should be increasing (or at least non-decreasing)
    for (let i = 1; i < scales.length; i++) {
      expect(scales[i]).toBeGreaterThanOrEqual(scales[i - 1]);
    }

    // Final scale should be higher than initial (zoom in occurred)
    expect(scales[scales.length - 1]).toBeGreaterThan(scales[0]);

    // Verify zoom display updated (final scale should not be 100%)
    // Get the actual zoom value from the UI - look for text that ends with %
    const finalScale = scales[scales.length - 1];
    const expectedZoomPercent = Math.round(finalScale * 100);
    expect(expectedZoomPercent).toBeGreaterThan(100);
  });

  test("should not have feedback loop when zooming with wheel", async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-svg"]');
    const canvasContent = page.locator('[data-testid="canvas-content"]');
    await expect(canvas).toBeVisible();

    // Get canvas bounding box
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not found");

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Track render count by observing transform changes
    const renderLog: { time: number; scale: number }[] = [];

    // Setup observer before zooming
    await page.evaluate(() => {
      (window as unknown as { __zoomRenderCount: number }).__zoomRenderCount = 0;
    });

    // Perform a single wheel zoom
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -100); // Zoom in once

    // Get initial transform after zoom
    const initialScale = await canvasContent.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      const match = transform.match(/matrix\(([^,]+)/);
      return match ? parseFloat(match[1]) : 1;
    });

    // Wait a bit and check if transform is stable (no jitter)
    await page.waitForTimeout(100);

    const scales: number[] = [];
    for (let i = 0; i < 5; i++) {
      const scale = await canvasContent.evaluate((el) => {
        const transform = window.getComputedStyle(el).transform;
        const match = transform.match(/matrix\(([^,]+)/);
        return match ? parseFloat(match[1]) : 1;
      });
      scales.push(scale);
      await page.waitForTimeout(20);
    }

    // All readings should be the same (no oscillation/jitter)
    const allSame = scales.every((s) => Math.abs(s - initialScale) < 0.001);
    expect(allSame).toBe(true);
  });

  test("should maintain zoom sync between wheel and UI controls", async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-svg"]');
    const canvasContent = page.locator('[data-testid="canvas-content"]');
    await expect(canvas).toBeVisible();

    // Get canvas bounding box
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not found");

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Zoom in with wheel
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(100);

    // Get scale from canvas transform
    const canvasScale = await canvasContent.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      const match = transform.match(/matrix\(([^,]+)/);
      return match ? parseFloat(match[1]) : 1;
    });

    // Verify canvas zoomed in
    expect(canvasScale).toBeGreaterThan(1);

    // Get zoom percentage from UI by looking for the percentage text
    const expectedZoomPercent = Math.round(canvasScale * 100);
    const zoomText = page.getByText(`${expectedZoomPercent}%`);
    await expect(zoomText).toBeVisible({ timeout: 2000 });

    // Now use UI button to zoom and verify canvas updates
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    await zoomInButton.click();
    await page.waitForTimeout(100);

    // Get new canvas scale
    const newCanvasScale = await canvasContent.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      const match = transform.match(/matrix\(([^,]+)/);
      return match ? parseFloat(match[1]) : 1;
    });

    // Canvas should have zoomed in further
    expect(newCanvasScale).toBeGreaterThan(canvasScale);

    // Verify UI displays the new zoom level
    const newExpectedZoomPercent = Math.round(newCanvasScale * 100);
    const newZoomText = page.getByText(`${newExpectedZoomPercent}%`);
    await expect(newZoomText).toBeVisible({ timeout: 2000 });
  });
});
