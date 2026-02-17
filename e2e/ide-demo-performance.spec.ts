/**
 * @file E2E tests for IDE Demo performance
 *
 * Measures component re-renders during user interactions in the IDE demo.
 * Uses react-scan logs to count component re-renders.
 */

import { test, expect } from "@playwright/test";

test.describe("IDE Demo Performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/app-demo/ide");
    await page.waitForTimeout(2000); // Wait for react-scan to initialize
  });

  test("measure re-renders during file tree navigation", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for the tree to load
    await page.waitForSelector('[role="treeitem"]', { timeout: 10000 });

    const logsBefore = allLogs.length;

    // Click on several tree items to expand/collapse and select
    const treeItems = page.locator('[role="treeitem"]');
    const count = await treeItems.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      await treeItems.nth(i).click();
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    // Analyze re-renders
    const logsAfter = allLogs.slice(logsBefore);
    const renderCounts: Record<string, number> = {};

    for (const log of logsAfter) {
      // Extract component names from react-scan logs
      const match = log.match(/\[log\].*?(\w+)/);
      if (match) {
        const component = match[1];
        renderCounts[component] = (renderCounts[component] || 0) + 1;
      }
    }

    console.log("=== File Tree Navigation Re-renders ===");
    console.log(`Total logs: ${logsAfter.length}`);
    console.log("Component render counts:", renderCounts);

    await page.screenshot({
      path: "e2e/screenshots/ide-demo-tree-nav.png",
      fullPage: true,
    });
  });

  test("measure re-renders during code editing", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for editor to render
    await page.waitForSelector("svg text", { timeout: 10000 });

    // Click on the editor to focus
    const editor = page.locator("div:has(> div > svg)").first();
    const box = await editor.boundingBox();
    if (!box) throw new Error("Could not get editor bounding box");

    await page.mouse.click(box.x + 100, box.y + 50);
    await page.waitForTimeout(300);

    const logsBefore = allLogs.length;

    // Type some text
    await page.keyboard.type("Hello World");
    await page.waitForTimeout(500);

    // Analyze re-renders
    const logsAfter = allLogs.slice(logsBefore);

    // Count specific component re-renders
    const singleBlockRenders = logsAfter.filter((l) => l.includes("SingleBlock")).length;
    const blockLineRenders = logsAfter.filter((l) => l.includes("BlockLine")).length;
    const navigatorRenders = logsAfter.filter((l) => l.includes("Navigator")).length;
    const inspectorRenders = logsAfter.filter((l) => l.includes("Inspector") || l.includes("IDEInspector")).length;

    console.log("=== Code Editing Re-renders ===");
    console.log(`SingleBlock re-renders: ${singleBlockRenders}`);
    console.log(`BlockLine re-renders: ${blockLineRenders}`);
    console.log(`Navigator re-renders (should be 0): ${navigatorRenders}`);
    console.log(`Inspector re-renders (should be 0): ${inspectorRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/ide-demo-editing.png",
      fullPage: true,
    });

    // Check: Navigator and Inspector should NOT re-render when editing
    // This is a potential optimization target
  });

  test("measure re-renders during tab switching", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for tabs to be visible
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    const logsBefore = allLogs.length;

    // Click on different tabs
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    for (let i = 0; i < Math.min(4, tabCount); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    console.log("=== Tab Switching Re-renders ===");
    console.log(`Total logs during tab switch: ${logsAfter.length}`);
    console.log("Sample logs:", logsAfter.slice(0, 10));

    await page.screenshot({
      path: "e2e/screenshots/ide-demo-tabs.png",
      fullPage: true,
    });
  });

  test("measure re-renders during search input", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Find the search input in the navigator
    const searchInput = page.locator('input[placeholder="Filter"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    const logsBefore = allLogs.length;

    // Type in search
    await searchInput.click();
    await searchInput.fill("Content");
    await page.waitForTimeout(500);

    const logsAfter = allLogs.slice(logsBefore);

    // Count editor re-renders (should be 0)
    const editorRenders = logsAfter.filter(
      (l) => l.includes("SingleBlock") || l.includes("BlockLine") || l.includes("CodeEditor")
    ).length;

    console.log("=== Search Input Re-renders ===");
    console.log(`Editor-related re-renders (should be 0): ${editorRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/ide-demo-search.png",
      fullPage: true,
    });
  });
});
