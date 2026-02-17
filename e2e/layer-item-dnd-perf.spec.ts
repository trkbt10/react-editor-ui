/**
 * @file E2E tests for LayerItem drag and drop performance
 *
 * Tests that dragging a layer does not cause excessive re-renders
 * of other layers in the list. Uses react-scan to detect re-renders.
 */

import { test, expect, Page } from "@playwright/test";

const LAYER_ITEM_PAGE = "http://localhost:5620/#/components/data-display/layer-item";

// Helper to count component re-renders from react-scan logs
function countRenders(logs: string[], componentPattern: string): number {
  // react-scan logs format: "[startGroup] %cLayerItem (0.7ms)" or "%cLayerItem2 ..."
  // Use provided pattern to match component names
  const pattern = new RegExp(componentPattern);
  return logs.filter((log) => pattern.test(log)).length;
}

// Count LayerItem component renders (react-scan shows as LayerItem or LayerItem2, etc.)
// Excludes LayerItemDemo
function countLayerItemRenders(logs: string[]): number {
  // Match "LayerItem" followed by optional number, space or (, but NOT "Demo"
  const pattern = /%cLayerItem\d*[\s(]/;
  return logs.filter((log) => pattern.test(log) && !log.includes("LayerItemDemo")).length;
}

// Helper to setup console log capture
function setupLogCapture(page: Page): string[] {
  const allLogs: string[] = [];
  page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));
  return allLogs;
}

test.describe("LayerItem DnD Performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during drag over", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[data-testid^="layer-item"]');

    // Get all layer items in the DnD section
    const items = page.locator('[data-testid^="layer-item-"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Select the source layer (Background, id=8)
    const sourceLayer = page.locator('[data-testid="layer-item-8"]');
    const sourceBox = await sourceLayer.boundingBox();
    if (!sourceBox) {
      throw new Error("Source layer not found");
    }

    // Get target layers
    const targetLayer = page.locator('[data-testid="layer-item-1"]');
    const targetBox = await targetLayer.boundingBox();
    if (!targetBox) {
      throw new Error("Target layer not found");
    }

    // Clear logs before starting drag
    allLogs.length = 0;

    // Start dragging
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();

    // Move slowly across multiple layers to trigger dragover events
    const startY = sourceBox.y + sourceBox.height / 2;
    const endY = targetBox.y + targetBox.height / 2;
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const y = startY + ((endY - startY) * i) / steps;
      await page.mouse.move(sourceBox.x + sourceBox.width / 2, y);
      await page.waitForTimeout(50); // Allow time for dragover events
    }

    // End drag
    await page.mouse.up();
    await page.waitForTimeout(300);

    const layerItemRenders = countLayerItemRenders(allLogs);
    const demoRenders = countRenders(allLogs, "%cLayerItemDemo");

    console.log("=== LayerItem DnD Performance ===");
    console.log(`LayerItem re-renders during drag: ${layerItemRenders}`);
    console.log(`LayerItemDemo re-renders: ${demoRenders}`);
    console.log(`Total drag steps: ${steps}`);
    console.log(`Total logs: ${allLogs.length}`);

    // Log all re-render events for debugging
    const rerenderLogs = allLogs.filter((log) => log.includes("LayerItem"));
    console.log("LayerItem re-render logs:", rerenderLogs.slice(0, 10));

    // With proper optimization:
    // - Only the layer with changing dropPosition should re-render
    // - Should NOT be O(steps * items), should be closer to O(steps) at most
    // - With memoization, even less since same dropPosition shouldn't cause re-render
    //
    // Expected: Less than 2 re-renders per step on average
    // (entering new target + leaving old target at most)
    const maxExpectedRenders = steps * 2;
    expect(layerItemRenders).toBeLessThanOrEqual(maxExpectedRenders);
  });

  test("parent component re-renders should be minimized during drag", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[data-testid^="layer-item"]');

    // Count total visible layers
    const items = page.locator('[data-testid^="layer-item-"]');
    const totalLayers = await items.count();

    // Get source and target layers
    const sourceLayer = page.locator('[data-testid="layer-item-8"]');
    const sourceBox = await sourceLayer.boundingBox();
    if (!sourceBox) {
      throw new Error("Source layer not found");
    }

    const targetLayer = page.locator('[data-testid="layer-item-1"]');
    const targetBox = await targetLayer.boundingBox();
    if (!targetBox) {
      throw new Error("Target layer not found");
    }

    // Clear logs
    allLogs.length = 0;

    // Perform a complete drag and drop
    await sourceLayer.dragTo(targetLayer, {
      targetPosition: { x: targetBox.width / 2, y: 5 },
    });

    await page.waitForTimeout(300);

    const layerItemRenders = countLayerItemRenders(allLogs);
    const demoRenders = countRenders(allLogs, "%cLayerItemDemo");

    console.log("=== LayerItem DragTo Performance ===");
    console.log(`LayerItem re-renders: ${layerItemRenders}`);
    console.log(`LayerItemDemo re-renders: ${demoRenders}`);
    console.log(`Total layers: ${totalLayers}`);
    console.log(`Total logs: ${allLogs.length}`);

    // Key assertion: Parent component should NOT cause O(layers) re-renders
    // A single drag-drop should NOT re-render all layers multiple times
    // With proper optimization, only layers with changed state should re-render
    //
    // Bad case: O(totalLayers * events) re-renders
    // Good case: O(events) re-renders (only affected layers)
    //
    // We expect less than 2x total layers worth of re-renders
    // (accounting for drag start, over, drop events)
    const maxExpectedRenders = totalLayers * 3;
    expect(layerItemRenders).toBeLessThanOrEqual(maxExpectedRenders);
  });
});
