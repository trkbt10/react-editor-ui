/**
 * @file E2E test for LayerItem continuous drag-over re-renders
 *
 * Tests that holding cursor over a drop target does NOT cause
 * continuous re-renders while the position is unchanged.
 */

import { test, expect, Page } from "@playwright/test";

const LAYER_ITEM_PAGE = "http://localhost:5620/#/components/data-display/layer-item";

function countRenders(logs: string[], pattern: string): number {
  return logs.filter((log) => log.includes(pattern)).length;
}

function setupLogCapture(page: Page): string[] {
  const allLogs: string[] = [];
  page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));
  return allLogs;
}

test.describe("LayerItem Continuous DragOver", () => {
  test("holding cursor over drop target should NOT cause continuous re-renders", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForTimeout(2000);
    await page.waitForSelector('[data-testid^="layer-item"]');

    // Get source layer (Background)
    const sourceLayer = page.locator('[data-testid="layer-item-8"]');
    const sourceBox = await sourceLayer.boundingBox();
    if (!sourceBox) {
      throw new Error("Source layer not found");
    }

    // Get target layer (Main Frame)
    const targetLayer = page.locator('[data-testid="layer-item-1"]');
    const targetBox = await targetLayer.boundingBox();
    if (!targetBox) {
      throw new Error("Target layer not found");
    }

    // Start drag using native browser events
    await sourceLayer.evaluate((el) => {
      const dragStartEvent = new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      el.dispatchEvent(dragStartEvent);
    });

    // Get target position for consistent clientY
    const targetRect = await targetLayer.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, height: rect.height };
    });
    // Position in "before" zone (top 25%)
    const fixedClientY = targetRect.top + 2;

    // Move to target and trigger initial dragover
    await targetLayer.evaluate((el, clientY) => {
      el.dispatchEvent(new DragEvent("dragenter", { bubbles: true }));
      el.dispatchEvent(new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        clientY,
      }));
    }, fixedClientY);

    // Wait for initial renders to settle
    await page.waitForTimeout(200);

    // Clear logs - we only care about re-renders AFTER settling on target
    allLogs.length = 0;

    // Simulate holding cursor still over target for 1 second
    // dragover events continue to fire while over a valid drop target
    const holdDuration = 1000;
    const eventInterval = 50; // dragover fires roughly every 50ms
    const expectedEvents = holdDuration / eventInterval;

    for (let i = 0; i < expectedEvents; i++) {
      await targetLayer.evaluate((el, clientY) => {
        el.dispatchEvent(new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          clientY,
        }));
      }, fixedClientY);
      await page.waitForTimeout(eventInterval);
    }

    // Capture logs BEFORE drag end (we're testing hover stability, not cleanup)
    const logsBeforeEnd = [...allLogs];

    // End drag
    await targetLayer.evaluate((el) => {
      el.dispatchEvent(new DragEvent("dragleave", { bubbles: true }));
    });
    await sourceLayer.evaluate((el) => {
      el.dispatchEvent(new DragEvent("dragend", { bubbles: true }));
    });

    await page.waitForTimeout(100);

    // Count re-renders during the hover period only
    const layerItemRenders = countRenders(logsBeforeEnd, "LayerItem");
    const demoRenders = countRenders(logsBeforeEnd, "LayerItemDemo");

    console.log("=== Continuous DragOver Test ===");
    console.log(`Duration: ${holdDuration}ms`);
    console.log(`DragOver events fired: ~${expectedEvents}`);
    console.log(`LayerItem re-renders: ${layerItemRenders}`);
    console.log(`LayerItemDemo re-renders: ${demoRenders}`);
    console.log(`Total logs: ${allLogs.length}`);

    // Show DnD debug logs
    const dndLogs = allLogs.filter((log) => log.includes("[DnD]"));
    console.log(`DnD state changes: ${dndLogs.length}`);
    dndLogs.forEach((log) => console.log(log));

    // KEY ASSERTION:
    // When holding cursor still over the same drop position,
    // there should be ZERO re-renders after the initial one.
    // The dropPosition hasn't changed, so nothing should update.
    expect(layerItemRenders).toBe(0);
    expect(demoRenders).toBe(0);
  });
});
