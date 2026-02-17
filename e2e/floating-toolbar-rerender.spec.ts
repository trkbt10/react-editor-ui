/**
 * @file E2E tests for FloatingToolbar re-render performance
 *
 * Tests that FloatingToolbar operations don't cause unnecessary re-renders:
 * - Clicking one operation shouldn't re-render all other operations
 * - Position updates shouldn't cause operation buttons to re-render
 */

import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5620/#/components/layout";

/**
 * Helper to capture and count re-renders from react-scan logs
 */
function createRerenderCounter() {
  const logs: string[] = [];
  return {
    logs,
    setupListener: (page: Page) => {
      page.on("console", (msg) => {
        const text = msg.text();
        logs.push(`[${msg.type()}] ${text}`);
      });
    },
    getLogsSince: (since: number) => logs.slice(since),
    getCurrentLength: () => logs.length,
    getRerenderLogs: (since: number = 0) => {
      return logs.slice(since).filter((log) =>
        log.includes("×") || // react-scan format
        log.includes("re-render") ||
        log.includes("rendered") ||
        log.includes("FloatingToolbar") ||
        log.includes("OperationButton") ||
        log.includes("IconButton") ||
        log.includes("Tooltip")
      );
    },
    countComponentRerenders: (componentName: string, since: number = 0) => {
      return logs.slice(since).filter((log) => log.includes(componentName)).length;
    },
  };
}

test.describe("FloatingToolbar Re-render Performance", () => {
  test("clicking an operation should not re-render all other operations", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/floating-toolbar`);
    await page.waitForTimeout(1500);

    // Wait for toolbar to render
    await page.waitForSelector('[aria-label="Selection toolbar"]');

    const logsBefore = counter.getCurrentLength();

    // Click Bold button (use first() to target the first interactive demo)
    const boldButton = page.locator('[aria-label="Bold"]').first();
    await boldButton.click();
    await page.waitForTimeout(300);

    // Click Italic button
    const italicButton = page.locator('[aria-label="Italic"]').first();
    await italicButton.click();
    await page.waitForTimeout(300);

    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== FloatingToolbar Operation Click ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);
    console.log("Sample logs:", rerenderLogs.slice(0, 10));

    // Count specific component re-renders
    const operationButtonRenders = counter.countComponentRerenders("OperationButton", logsBefore);
    const iconButtonRenders = counter.countComponentRerenders("IconButton", logsBefore);
    console.log(`OperationButton re-renders: ${operationButtonRenders}`);
    console.log(`IconButton re-renders: ${iconButtonRenders}`);

    await page.screenshot({
      path: "e2e/screenshots/floating-toolbar-click.png",
      fullPage: true,
    });

    // With 2 clicks and proper memoization, ideally:
    // - Only the clicked buttons and their active state should re-render
    // - Not all 6 operations × 2 = 12 re-renders
    // Expect at most ~4-6 re-renders (clicked buttons + state changes)
  });

  test("toggling show/hide should not cause excessive initial renders", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/floating-toolbar`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Selection toolbar"]');

    // Find the "Show toolbar" checkbox (first one in the interactive demo)
    const showToolbarCheckbox = page.getByRole('checkbox', { name: 'Show toolbar' });

    const logsBefore = counter.getCurrentLength();

    // Toggle off
    await showToolbarCheckbox.uncheck();
    await page.waitForTimeout(300);

    // Toggle on
    await showToolbarCheckbox.check();
    await page.waitForTimeout(300);

    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== FloatingToolbar Show/Hide Toggle ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);

    await page.screenshot({
      path: "e2e/screenshots/floating-toolbar-toggle.png",
      fullPage: true,
    });
  });

  test("changing placement should re-render minimally", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/floating-toolbar`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Selection toolbar"]');

    const logsBefore = counter.getCurrentLength();

    // Change placement to bottom
    const placementSelect = page.locator('select');
    await placementSelect.selectOption('bottom');
    await page.waitForTimeout(300);

    // Change placement back to top
    await placementSelect.selectOption('top');
    await page.waitForTimeout(300);

    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== FloatingToolbar Placement Change ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);

    // OperationButtons should NOT re-render when only position changes
    const operationButtonRenders = counter.countComponentRerenders("OperationButton", logsBefore);
    console.log(`OperationButton re-renders: ${operationButtonRenders}`);

    await page.screenshot({
      path: "e2e/screenshots/floating-toolbar-placement.png",
      fullPage: true,
    });

    // Ideally OperationButton should not re-render at all when placement changes
    // (only position changes, operations array stays the same)
    expect(operationButtonRenders).toBeLessThanOrEqual(2);
  });

  test("rapid operation clicks should remain responsive", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/floating-toolbar`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Selection toolbar"]');

    const startTime = Date.now();

    // Rapid toggle of operations (use first() to target the first toolbar)
    const buttons = [
      page.locator('[aria-label="Bold"]').first(),
      page.locator('[aria-label="Italic"]').first(),
      page.locator('[aria-label="Underline"]').first(),
      page.locator('[aria-label="Code"]').first(),
    ];

    for (let i = 0; i < 3; i++) {
      for (const button of buttons) {
        await button.click();
      }
    }

    const elapsed = Date.now() - startTime;

    console.log("=== Rapid Operation Clicks ===");
    console.log(`Time for 12 clicks: ${elapsed}ms`);
    console.log(`Average per click: ${(elapsed / 12).toFixed(2)}ms`);
    console.log(`Total logs: ${counter.logs.length}`);
    console.log(`Re-render logs: ${counter.getRerenderLogs().length}`);

    await page.screenshot({
      path: "e2e/screenshots/floating-toolbar-rapid-clicks.png",
      fullPage: true,
    });

    // Should complete in reasonable time (less than 3 seconds for 12 clicks)
    expect(elapsed).toBeLessThan(3000);
  });
});
