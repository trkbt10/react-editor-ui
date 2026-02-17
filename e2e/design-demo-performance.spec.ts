/**
 * @file E2E tests for Design Demo performance
 *
 * Measures component re-renders during user interactions in the Design demo.
 * Uses react-scan logs to count component re-renders.
 */

import { test, expect } from "@playwright/test";

test.describe("Design Demo Performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/app-demo/design");
    await page.waitForTimeout(2000); // Wait for react-scan to initialize
  });

  test("measure re-renders during canvas pan", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Find the canvas
    const canvas = page.locator('[role="application"]').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const box = await canvas.boundingBox();
    if (!box) throw new Error("Could not get canvas bounding box");

    const logsBefore = allLogs.length;

    // Pan with Alt+drag
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.keyboard.down("Alt");
    await page.mouse.down();

    for (let i = 0; i < 20; i++) {
      await page.mouse.move(centerX + i * 5, centerY + i * 3);
      await page.waitForTimeout(50);
    }

    await page.mouse.up();
    await page.keyboard.up("Alt");
    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    // Count component re-renders
    const sidebarRenders = logsAfter.filter((l) => l.includes("Sidebar")).length;
    const inspectorRenders = logsAfter.filter((l) => l.includes("Inspector")).length;
    const layerItemRenders = logsAfter.filter((l) => l.includes("LayerItem")).length;
    const canvasRenders = logsAfter.filter((l) => l.includes("Canvas")).length;
    const boundingBoxRenders = logsAfter.filter((l) => l.includes("BoundingBox")).length;

    console.log("=== Canvas Pan Re-renders ===");
    console.log(`Sidebar re-renders (should be 0): ${sidebarRenders}`);
    console.log(`Inspector re-renders: ${inspectorRenders}`);
    console.log(`LayerItem re-renders (should be 0): ${layerItemRenders}`);
    console.log(`Canvas re-renders: ${canvasRenders}`);
    console.log(`BoundingBox re-renders: ${boundingBoxRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/design-demo-pan.png",
      fullPage: true,
    });
  });

  test("measure re-renders during BoundingBox drag", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for canvas and bounding box
    await page.waitForSelector('[role="application"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Find the bounding box (selection handles)
    const canvas = page.locator('[role="application"]').first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Could not get canvas bounding box");

    const logsBefore = allLogs.length;

    // Click and drag on the design element
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();

    for (let i = 0; i < 20; i++) {
      await page.mouse.move(startX + i * 3, startY + i * 2);
      await page.waitForTimeout(50);
    }

    await page.mouse.up();
    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    // Count re-renders
    const sidebarRenders = logsAfter.filter((l) => l.includes("Sidebar")).length;
    const layerItemRenders = logsAfter.filter((l) => l.includes("LayerItem")).length;
    const fileTabBarRenders = logsAfter.filter((l) => l.includes("FileTabBar")).length;

    console.log("=== BoundingBox Drag Re-renders ===");
    console.log(`Sidebar re-renders (should be 0): ${sidebarRenders}`);
    console.log(`LayerItem re-renders (should be 0): ${layerItemRenders}`);
    console.log(`FileTabBar re-renders (should be 0): ${fileTabBarRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/design-demo-drag.png",
      fullPage: true,
    });
  });

  test("measure re-renders during layer selection", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for layer items
    await page.waitForSelector('[data-testid]', { timeout: 10000 });

    const logsBefore = allLogs.length;

    // Click on several layer items
    const layerItems = page.locator('[role="treeitem"]');
    const count = await layerItems.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      await layerItems.nth(i).click();
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    // Count unrelated re-renders
    const canvasAreaRenders = logsAfter.filter((l) => l.includes("CanvasArea")).length;
    const fileTabBarRenders = logsAfter.filter((l) => l.includes("FileTabBar")).length;

    console.log("=== Layer Selection Re-renders ===");
    console.log(`CanvasArea re-renders: ${canvasAreaRenders}`);
    console.log(`FileTabBar re-renders (should be 0): ${fileTabBarRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/design-demo-layer-select.png",
      fullPage: true,
    });
  });

  test("measure re-renders during tool selection", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for toolbar
    await page.waitForSelector('[aria-label="Move"]', { timeout: 10000 });

    const logsBefore = allLogs.length;

    // Click on different tools
    const tools = ["Move", "Frame", "Rectangle", "Pen", "Text", "Ellipse"];
    for (const tool of tools) {
      const button = page.locator(`[aria-label="${tool}"]`);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(150);
      }
    }

    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    // Count unrelated re-renders
    const sidebarRenders = logsAfter.filter((l) => l.includes("Sidebar")).length;
    const inspectorRenders = logsAfter.filter((l) => l.includes("Inspector")).length;
    const layerItemRenders = logsAfter.filter((l) => l.includes("LayerItem")).length;

    console.log("=== Tool Selection Re-renders ===");
    console.log(`Sidebar re-renders (should be 0): ${sidebarRenders}`);
    console.log(`Inspector re-renders (should be 0): ${inspectorRenders}`);
    console.log(`LayerItem re-renders (should be 0): ${layerItemRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/design-demo-tools.png",
      fullPage: true,
    });
  });

  test("measure re-renders during color picker interaction", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for color input
    const colorInput = page.locator('input[type="text"]').first();
    await expect(colorInput).toBeVisible({ timeout: 10000 });

    const logsBefore = allLogs.length;

    // Interact with color input
    await colorInput.click();
    await colorInput.fill("#ff0000");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    // Count unrelated re-renders
    const sidebarRenders = logsAfter.filter((l) => l.includes("Sidebar")).length;
    const canvasRenders = logsAfter.filter((l) => l.includes("Canvas")).length;
    const layerItemRenders = logsAfter.filter((l) => l.includes("LayerItem")).length;

    console.log("=== Color Picker Re-renders ===");
    console.log(`Sidebar re-renders (should be 0): ${sidebarRenders}`);
    console.log(`Canvas re-renders (should be minimal): ${canvasRenders}`);
    console.log(`LayerItem re-renders (should be 0): ${layerItemRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/design-demo-color.png",
      fullPage: true,
    });
  });
});
