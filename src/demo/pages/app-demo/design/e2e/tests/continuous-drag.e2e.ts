/**
 * @file Test continuous dragging to detect drift or acceleration issues
 */

import { test, expect } from "@playwright/test";

const PROD_URL = "http://localhost:5620";

test.describe("Design Editor - Continuous Drag Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PROD_URL}/#/app-demo/design`);
    await page.waitForSelector('[data-testid="canvas-svg"]', { timeout: 10000 });
  });

  test("continuous drag should track accurately", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const initialBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    console.log(`Initial position: (${initialBox.x.toFixed(2)}, ${initialBox.y.toFixed(2)})`);

    // Start drag
    await page.mouse.move(initialBox.x, initialBox.y);
    await page.mouse.down();

    // Move in small increments (simulating real mouse movement)
    const steps = 20;
    const stepSize = 5; // 5px per step
    const totalExpectedMove = steps * stepSize; // 100px total

    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(initialBox.x + i * stepSize, initialBox.y + i * stepSize);
      await page.waitForTimeout(16); // ~60fps
    }

    await page.mouse.up();
    await page.waitForTimeout(100);

    const finalBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    const totalDeltaX = finalBox.x - initialBox.x;
    const totalDeltaY = finalBox.y - initialBox.y;
    const ratioX = totalDeltaX / totalExpectedMove;
    const ratioY = totalDeltaY / totalExpectedMove;

    console.log(`=== CONTINUOUS DRAG (${steps} steps of ${stepSize}px) ===`);
    console.log(`Expected total: ${totalExpectedMove}px`);
    console.log(`Actual delta: (${totalDeltaX.toFixed(2)}, ${totalDeltaY.toFixed(2)})`);
    console.log(`Ratio: ${ratioX.toFixed(3)}x, ${ratioY.toFixed(3)}x`);

    // Should be close to 1:1
    expect(ratioX).toBeGreaterThan(0.8);
    expect(ratioX).toBeLessThan(1.2);
  });

  test("fast continuous drag", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const initialBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    // Fast drag without waiting between moves
    await page.mouse.move(initialBox.x, initialBox.y);
    await page.mouse.down();

    const steps = 50;
    const stepSize = 2; // 2px per step, total 100px

    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(initialBox.x + i * stepSize, initialBox.y + i * stepSize);
      // No wait - simulate fast dragging
    }

    await page.mouse.up();
    await page.waitForTimeout(100);

    const finalBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    const totalDeltaX = finalBox.x - initialBox.x;
    const totalDeltaY = finalBox.y - initialBox.y;
    const expectedMove = steps * stepSize;
    const ratioX = totalDeltaX / expectedMove;

    console.log(`=== FAST DRAG (${steps} steps of ${stepSize}px) ===`);
    console.log(`Expected: ${expectedMove}px, Actual: ${totalDeltaX.toFixed(2)}px`);
    console.log(`Ratio: ${ratioX.toFixed(3)}x`);

    expect(ratioX).toBeGreaterThan(0.8);
    expect(ratioX).toBeLessThan(1.2);
  });

  test("track intermediate positions during drag", async ({ page }) => {
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const initialBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    await page.mouse.move(initialBox.x, initialBox.y);
    await page.mouse.down();

    const measurements: Array<{ cursor: number; box: number; ratio: number }> = [];
    const stepSize = 20;
    const steps = 5;

    for (let i = 1; i <= steps; i++) {
      const cursorX = initialBox.x + i * stepSize;
      await page.mouse.move(cursorX, initialBox.y + i * stepSize);
      await page.waitForTimeout(50); // Wait for React to update

      const currentBox = await moveArea.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.x + rect.width / 2;
      });

      const expectedCursorDelta = i * stepSize;
      const actualBoxDelta = currentBox - initialBox.x;
      const ratio = actualBoxDelta / expectedCursorDelta;

      measurements.push({
        cursor: expectedCursorDelta,
        box: actualBoxDelta,
        ratio,
      });
    }

    await page.mouse.up();

    console.log("=== INTERMEDIATE POSITION TRACKING ===");
    measurements.forEach((m, i) => {
      console.log(`Step ${i + 1}: cursor +${m.cursor}px, box +${m.box.toFixed(1)}px, ratio ${m.ratio.toFixed(3)}x`);
    });

    // Check that all ratios are close to 1
    const avgRatio = measurements.reduce((sum, m) => sum + m.ratio, 0) / measurements.length;
    console.log(`Average ratio: ${avgRatio.toFixed(3)}x`);

    expect(avgRatio).toBeGreaterThan(0.8);
    expect(avgRatio).toBeLessThan(1.2);
  });
});
