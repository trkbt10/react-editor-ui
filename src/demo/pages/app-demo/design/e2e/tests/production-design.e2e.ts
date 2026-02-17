/**
 * @file Design E2E tests against PRODUCTION demo (localhost:5620)
 * This tests the actual demo environment, not the isolated E2E environment
 */

import { test, expect } from "@playwright/test";

// Use production demo URL
const PROD_URL = "http://localhost:5620";

test.describe("Design Editor - Production Demo Movement Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PROD_URL}/#/app-demo/design`);
    // Wait for the canvas to be rendered
    await page.waitForSelector('[data-testid="canvas-svg"]', { timeout: 10000 });
  });

  test("DEBUG: measure all scale factors in production", async ({ page }) => {
    // Find the canvas container
    const canvas = page.locator('[role="application"]');
    await expect(canvas).toBeVisible();

    // Measure scale at different levels
    const scaleInfo = await canvas.evaluate((el) => {
      const results: Array<{
        element: string;
        rectWidth: number;
        rectHeight: number;
        offsetWidth: number;
        offsetHeight: number;
        scaleX: number;
        scaleY: number;
        transform: string;
      }> = [];

      let current: HTMLElement | null = el as HTMLElement;
      let level = 0;

      while (current && current !== document.body && level < 10) {
        const rect = current.getBoundingClientRect();
        const style = window.getComputedStyle(current);
        const transform = style.transform;

        results.push({
          element: `${current.tagName}${current.className ? '.' + current.className.split(' ')[0] : ''}`,
          rectWidth: rect.width,
          rectHeight: rect.height,
          offsetWidth: current.offsetWidth,
          offsetHeight: current.offsetHeight,
          scaleX: rect.width / current.offsetWidth,
          scaleY: rect.height / current.offsetHeight,
          transform: transform,
        });

        current = current.parentElement;
        level++;
      }

      return results;
    });

    console.log("=== PRODUCTION SCALE HIERARCHY ===");
    scaleInfo.forEach((info, i) => {
      console.log(`Level ${i}: ${info.element}`);
      console.log(`  rect: ${info.rectWidth.toFixed(1)} x ${info.rectHeight.toFixed(1)}`);
      console.log(`  offset: ${info.offsetWidth} x ${info.offsetHeight}`);
      console.log(`  scale: ${info.scaleX.toFixed(4)} x ${info.scaleY.toFixed(4)}`);
      console.log(`  transform: ${info.transform}`);
    });
  });

  test("should have 1:1 movement ratio in production", async ({ page }) => {
    // Wait for bounding box to be visible (element is pre-selected)
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const initialBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    // Perform drag
    const dragDistance = 50;
    await page.mouse.move(initialBox.x, initialBox.y);
    await page.mouse.down();
    await page.mouse.move(initialBox.x + dragDistance, initialBox.y + dragDistance);
    await page.mouse.up();

    await page.waitForTimeout(100);

    const newBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    const deltaX = newBox.x - initialBox.x;
    const deltaY = newBox.y - initialBox.y;
    const ratioX = deltaX / dragDistance;
    const ratioY = deltaY / dragDistance;

    console.log("=== PRODUCTION MOVEMENT TEST ===");
    console.log(`Drag distance: ${dragDistance}px`);
    console.log(`Actual delta: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`);
    console.log(`Movement ratio X: ${ratioX.toFixed(3)}`);
    console.log(`Movement ratio Y: ${ratioY.toFixed(3)}`);

    // The ratio should be close to 1:1
    // If ratio is much higher (e.g., 4x), the bug exists
    expect(ratioX).toBeGreaterThan(0.5);
    expect(ratioX).toBeLessThan(2.0);
    expect(ratioY).toBeGreaterThan(0.5);
    expect(ratioY).toBeLessThan(2.0);
  });

  test("detect erratic movement with small drag", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const box = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    // Small drag
    const smallDrag = 10;
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.mouse.move(box.x + smallDrag, box.y + smallDrag);
    await page.mouse.up();

    await page.waitForTimeout(100);

    const newBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    const deltaX = Math.abs(newBox.x - box.x);
    const deltaY = Math.abs(newBox.y - box.y);
    const ratioX = deltaX / smallDrag;
    const ratioY = deltaY / smallDrag;

    console.log("=== SMALL DRAG TEST ===");
    console.log(`Drag: ${smallDrag}px, Movement: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`);
    console.log(`Ratio: ${ratioX.toFixed(2)}x, ${ratioY.toFixed(2)}x`);

    // If ratio > 3, there's a problem
    if (ratioX > 3 || ratioY > 3) {
      console.log("!!! ERRATIC MOVEMENT DETECTED !!!");
    }

    expect(deltaX).toBeLessThan(smallDrag * 5);
    expect(deltaY).toBeLessThan(smallDrag * 5);
  });
});
