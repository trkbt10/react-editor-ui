/**
 * @file BoundingBox E2E tests
 */

import { test, expect } from "@playwright/test";

test.describe("BoundingBox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/bounding-box");
    await page.waitForSelector('[data-testid="bounding-box"]');
  });

  test("should render bounding box with handles", async ({ page }) => {
    await expect(page.locator('[data-testid="bounding-box"]')).toBeVisible();
    await expect(page.locator('[data-testid="bounding-box-border"]')).toBeVisible();
    await expect(page.locator('[data-testid="bounding-box-handle-top-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="bounding-box-handle-bottom-right"]')).toBeVisible();
  });

  test("should show size label", async ({ page }) => {
    await expect(page.locator('[data-testid="bounding-box-label"]')).toBeVisible();
  });

  test("should move box on drag", async ({ page }) => {
    const border = page.locator('[data-testid="bounding-box-move-area"]');
    const box = await border.boundingBox();
    if (!box) {
      throw new Error("BoundingBox not found");
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 30);
    await page.mouse.up();

    const lastAction = await page.locator('[data-testid="last-action"]').textContent();
    expect(lastAction).toBe("move");
  });

  test("should resize box from corner handle", async ({ page }) => {
    const handle = page.locator('[data-testid="bounding-box-handle-bottom-right"]');
    const handleBox = await handle.boundingBox();
    if (!handleBox) {
      throw new Error("Handle not found");
    }

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 30);
    await page.mouse.up();

    const lastAction = await page.locator('[data-testid="last-action"]').textContent();
    expect(lastAction).toBe("resize-bottom-right");
  });

  test("should rotate box from rotation zone", async ({ page }) => {
    const zone = page.locator('[data-testid="bounding-box-rotation-zone-top-right"]');
    const zoneBox = await zone.boundingBox();
    if (!zoneBox) {
      throw new Error("Rotation zone not found");
    }

    const startX = zoneBox.x + zoneBox.width / 2;
    const startY = zoneBox.y + zoneBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 50);
    await page.mouse.up();

    const lastAction = await page.locator('[data-testid="last-action"]').textContent();
    expect(lastAction).toBe("rotate");
  });

  test("handles should scale with zoom", async ({ page }) => {
    const handle = page.locator('[data-testid="bounding-box-handle-top-left"]');
    const initialBox = await handle.boundingBox();
    if (!initialBox) {
      throw new Error("Handle not found");
    }
    const initialSize = initialBox.width;

    // Zoom in
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
      throw new Error("Canvas not found");
    }

    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(200);

    const zoomedBox = await handle.boundingBox();
    if (!zoomedBox) {
      throw new Error("Handle not found after zoom");
    }

    // Handle should remain similar screen size after zoom (inverse scaling)
    expect(Math.abs(zoomedBox.width - initialSize)).toBeLessThan(2);
  });
});
