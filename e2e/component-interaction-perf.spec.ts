/**
 * @file E2E tests for component interaction performance
 *
 * Tests individual component re-renders during pointer interactions:
 * - BoundingBox: drag, resize, rotate
 * - Canvas: pan, zoom
 * - LayerItem: drag and drop, selection
 * - Slider: drag
 * - ColorPicker: drag operations
 */

import { test, expect } from "@playwright/test";

// Helper to count component re-renders from react-scan logs
function countRenders(logs: string[], componentName: string): number {
  return logs.filter((log) => log.includes(componentName)).length;
}

test.describe("BoundingBox Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/canvas/bounding-box");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during drag move", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    const canvas = page.locator('[data-testid="bounding-box"]').first();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) throw new Error("No bounding box");

    const logsBefore = allLogs.length;

    // Drag the bounding box center
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(centerX + i * 5, centerY + i * 3);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const boundingBoxRenders = countRenders(logsAfter, "BoundingBox");
    const handleRenders = countRenders(logsAfter, "Handle");

    console.log("=== BoundingBox Drag Move ===");
    console.log(`BoundingBox re-renders: ${boundingBoxRenders}`);
    console.log(`Handle re-renders: ${handleRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during resize", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    const canvas = page.locator('[data-testid="bounding-box"]').first();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) throw new Error("No bounding box");

    const logsBefore = allLogs.length;

    // Drag bottom-right corner to resize
    const cornerX = box.x + box.width;
    const cornerY = box.y + box.height;

    await page.mouse.move(cornerX - 5, cornerY - 5);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(cornerX + i * 5, cornerY + i * 5);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== BoundingBox Resize ===");
    console.log(`BoundingBox re-renders: ${countRenders(logsAfter, "BoundingBox")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("Canvas Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/canvas/canvas");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during pan (Alt+drag)", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    const canvas = page.locator('[role="application"]').first();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) throw new Error("No canvas");

    const logsBefore = allLogs.length;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.keyboard.down("Alt");
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(centerX + i * 4, centerY + i * 3);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.keyboard.up("Alt");
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== Canvas Pan ===");
    console.log(`Canvas re-renders: ${countRenders(logsAfter, "Canvas")}`);
    console.log(`CanvasGridLayer re-renders: ${countRenders(logsAfter, "CanvasGridLayer")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during zoom (wheel)", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    const canvas = page.locator('[role="application"]').first();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) throw new Error("No canvas");

    const logsBefore = allLogs.length;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -50);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== Canvas Zoom ===");
    console.log(`Canvas re-renders: ${countRenders(logsAfter, "Canvas")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("LayerItem Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/layer-item");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during selection changes", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    await page.waitForSelector('[data-testid^="layer-item"]');

    const logsBefore = allLogs.length;

    // Click on multiple layer items
    const items = page.locator('[data-testid^="layer-item"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await items.nth(i).click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== LayerItem Selection ===");
    console.log(`LayerItem re-renders: ${countRenders(logsAfter, "LayerItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during visibility toggle", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    // Wait for layer items to load
    await page.waitForSelector('[data-testid^="layer-item"]');

    const logsBefore = allLogs.length;

    // Hover over layer items to show visibility toggles, then click
    const items = page.locator('[data-testid^="layer-item"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      const item = items.nth(i);
      await item.hover();
      await page.waitForTimeout(100);
      // Try to find and click the visibility toggle that appears on hover
      const toggle = item.locator('[data-testid="visibility-toggle"]');
      if (await toggle.isVisible({ timeout: 500 }).catch(() => false)) {
        await toggle.click();
        await page.waitForTimeout(100);
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== LayerItem Visibility Toggle ===");
    console.log(`LayerItem re-renders: ${countRenders(logsAfter, "LayerItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during expand/collapse", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    // Wait for layer items
    await page.waitForSelector('[data-testid^="layer-item"]');
    await page.waitForTimeout(500);

    const logsBefore = allLogs.length;

    // Toggle expand/collapse by clicking on expanders - re-query each time
    for (let i = 0; i < 3; i++) {
      const expander = page.locator('[role="button"][aria-label="Expand"], [role="button"][aria-label="Collapse"]').first();
      if (await expander.isVisible({ timeout: 500 }).catch(() => false)) {
        await expander.click();
        await page.waitForTimeout(150);
      } else {
        break;
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== LayerItem Expand/Collapse ===");
    console.log(`LayerItem re-renders: ${countRenders(logsAfter, "LayerItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("Slider Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Use StrokeSettingsPanel which contains Slider components
    await page.goto("http://localhost:5620/#/components/composite/stroke-settings-panel");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during drag", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    // Find slider by looking for the slider container
    const sliderContainer = page.locator('[data-testid="slider"]').first();
    if (!(await sliderContainer.isVisible())) {
      // Try finding any input range element
      const rangeInput = page.locator('input[type="range"]').first();
      if (!(await rangeInput.isVisible())) {
        console.log("No slider found, skipping");
        return;
      }
    }

    const box = await sliderContainer.boundingBox();
    if (!box) {
      console.log("No slider bounding box, skipping");
      return;
    }

    const logsBefore = allLogs.length;
    const startX = box.x + box.width * 0.3;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(startX + i * 5, startY);
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== Slider Drag ===");
    console.log(`Slider re-renders: ${countRenders(logsAfter, "Slider")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("ColorPicker Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/primitives/color-picker");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during saturation/brightness drag", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    // Find the saturation/brightness area by looking for gradient background
    // The area is typically a div with a gradient background inside ColorPicker
    const colorPickerArea = page.locator('[style*="linear-gradient"]').first();
    if (!(await colorPickerArea.isVisible())) {
      console.log("Color picker gradient area not found, skipping");
      return;
    }

    const box = await colorPickerArea.boundingBox();
    if (!box) {
      console.log("No color picker area bounding box, skipping");
      return;
    }

    const logsBefore = allLogs.length;

    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(box.x + 10 + i * 10, box.y + 10 + i * 5);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== ColorPicker Saturation Drag ===");
    console.log(`ColorPicker re-renders: ${countRenders(logsAfter, "ColorPicker")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("TreeItem Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/tree-item");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during expand/collapse", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    await page.waitForSelector('[role="treeitem"]');

    const logsBefore = allLogs.length;

    // Click on tree items with children
    const expanders = page.locator('[aria-label="Expand"], [aria-label="Collapse"]');
    const count = await expanders.count();
    for (let i = 0; i < Math.min(4, count); i++) {
      await expanders.nth(i).click();
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== TreeItem Expand/Collapse ===");
    console.log(`TreeItem re-renders: ${countRenders(logsAfter, "TreeItem")}`);
    console.log(`Expander re-renders: ${countRenders(logsAfter, "Expander")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during selection", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    await page.waitForSelector('[role="treeitem"]');

    const logsBefore = allLogs.length;

    // Click on multiple tree items
    const items = page.locator('[role="treeitem"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await items.nth(i).click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== TreeItem Selection ===");
    console.log(`TreeItem re-renders: ${countRenders(logsAfter, "TreeItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("IconButton Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/primitives/icon-button");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during hover", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    const buttons = page.locator('button[aria-label]');
    await expect(buttons.first()).toBeVisible();

    const logsBefore = allLogs.length;

    // Hover over multiple buttons
    const count = await buttons.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await buttons.nth(i).hover();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== IconButton Hover ===");
    console.log(`IconButton re-renders: ${countRenders(logsAfter, "IconButton")}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Each button should only re-render for its own hover state
    // If total is much higher than button count * 2 (hover in + out), there's a problem
  });
});

test.describe("TabBar Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/primitives/tab-bar");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during tab switching", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

    const tabs = page.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible();

    const logsBefore = allLogs.length;

    // Click through tabs
    const count = await tabs.count();
    for (let i = 0; i < Math.min(4, count); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== TabBar Tab Switching ===");
    console.log(`TabBar re-renders: ${countRenders(logsAfter, "TabBar")}`);
    console.log(`TabButton re-renders: ${countRenders(logsAfter, "TabButton")}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Only the changed tabs should re-render (previous active + new active)
  });
});
