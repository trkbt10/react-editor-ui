/**
 * @file Canvas performance investigation with react-scan
 */

import { test, expect } from "@playwright/test";

test.describe("Canvas Performance", () => {
  test("measure BoundingBox render performance", async ({ page }) => {
    // Collect ALL console logs
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("http://localhost:5620/#/components/canvas/bounding-box");
    await page.waitForTimeout(2000); // Wait for react-scan to initialize

    // Find the interactive canvas
    const canvas = page.locator('[data-testid="bounding-box"]').first();
    await expect(canvas).toBeVisible();

    // Get bounding box of the canvas container
    const boundingBox = await canvas.boundingBox();
    if (!boundingBox) {
      throw new Error("Could not get bounding box");
    }

    // Take screenshot before interaction
    await page.screenshot({
      path: "e2e/screenshots/canvas-before-drag.png",
      fullPage: true,
    });

    // Clear logs before interaction
    const logsBefore = allLogs.length;

    // Simulate drag movement
    const startX = boundingBox.x + boundingBox.width / 2;
    const startY = boundingBox.y + boundingBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Move in small increments to simulate drag
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(startX + i * 5, startY + i * 3);
      await page.waitForTimeout(50); // Slower for react-scan to capture
    }

    // Take screenshot during drag (react-scan highlights should be visible)
    await page.screenshot({
      path: "e2e/screenshots/canvas-during-drag.png",
      fullPage: true,
    });

    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Take screenshot after
    await page.screenshot({
      path: "e2e/screenshots/canvas-after-drag.png",
      fullPage: true,
    });

    // Log render info
    console.log("=== All Console Logs During Drag ===");
    console.log(`Logs before: ${logsBefore}, Logs after: ${allLogs.length}`);
    allLogs.slice(logsBefore).forEach((log) => console.log(log));
  });

  test("check component re-renders during viewport pan", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("http://localhost:5620/#/components/canvas/canvas");
    await page.waitForTimeout(2000);

    // Find canvas element
    const canvas = page.locator('[role="application"]').first();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Could not get canvas bounding box");
    }

    const logsBefore = allLogs.length;

    // Pan with Alt+drag
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.keyboard.down("Alt");
    await page.mouse.down();

    for (let i = 0; i < 30; i++) {
      await page.mouse.move(centerX + i * 3, centerY + i * 2);
      await page.waitForTimeout(50);
    }

    await page.screenshot({
      path: "e2e/screenshots/canvas-pan-during.png",
      fullPage: true,
    });

    await page.mouse.up();
    await page.keyboard.up("Alt");
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "e2e/screenshots/canvas-pan-after.png",
      fullPage: true,
    });

    console.log("=== All Console Logs During Pan ===");
    console.log(`Logs before: ${logsBefore}, Logs after: ${allLogs.length}`);
    allLogs.slice(logsBefore).forEach((log) => console.log(log));
  });
});
