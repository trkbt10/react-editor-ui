/**
 * @file E2E tests for TextEditor re-render performance
 *
 * Measures SingleBlock and BlockLine re-renders during:
 * - Cursor movement (clicking)
 * - Text selection (dragging)
 * - Text editing (typing)
 *
 * Uses react-scan logs to count component re-renders.
 */

import { test, expect } from "@playwright/test";

test.describe("TextEditor Re-render Performance", () => {
  test("measure SingleBlock re-renders during cursor click", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("http://localhost:5620/#/components/editor/text-editor-perf");
    await page.waitForTimeout(2000);

    // Wait for editor to render
    await page.waitForSelector("svg text", { timeout: 10000 });

    const editor = page.locator("div:has(> div > svg)").first();
    const box = await editor.boundingBox();
    if (!box) throw new Error("Could not get editor bounding box");

    // Clear logs before test
    const logsBefore = allLogs.length;

    // Click at different positions to trigger cursor changes
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(box.x + 50 + i * 30, box.y + 30 + i * 21);
      await page.waitForTimeout(100);

      // Screenshot during interaction to see react-scan highlights
      if (i === 2) {
        await page.screenshot({
          path: "e2e/screenshots/text-editor-cursor-during.png",
          fullPage: true,
        });
      }
    }

    // Wait for renders to complete
    await page.waitForTimeout(500);

    // Count SingleBlock re-renders
    const singleBlockRenders = allLogs
      .slice(logsBefore)
      .filter((log) => log.includes("SingleBlock")).length;

    const blockLineRenders = allLogs
      .slice(logsBefore)
      .filter((log) => log.includes("BlockLine")).length;

    console.log("=== Cursor Click Re-renders ===");
    console.log(`SingleBlock re-renders: ${singleBlockRenders}`);
    console.log(`BlockLine re-renders: ${blockLineRenders}`);
    console.log(`Total logs during test: ${allLogs.length - logsBefore}`);

    // Take screenshot
    await page.screenshot({
      path: "e2e/screenshots/text-editor-cursor-click.png",
      fullPage: true,
    });

    // Ideally, only the affected blocks should re-render
    // With 50 lines and 5 clicks, we expect much fewer than 50*5=250 SingleBlock renders
    // A well-optimized implementation should have close to 5 SingleBlock renders (one per click)
  });

  test("measure SingleBlock re-renders during text selection", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("http://localhost:5620/#/components/editor/text-editor-perf");
    await page.waitForTimeout(2000);

    await page.waitForSelector("svg text", { timeout: 10000 });

    const editor = page.locator("div:has(> div > svg)").first();
    const box = await editor.boundingBox();
    if (!box) throw new Error("Could not get editor bounding box");

    const logsBefore = allLogs.length;

    // Drag to select text across multiple lines
    await page.mouse.move(box.x + 20, box.y + 30);
    await page.mouse.down();

    // Drag across 5 lines
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(box.x + 100, box.y + 30 + i * 21);
      await page.waitForTimeout(50);
    }

    await page.mouse.up();
    await page.waitForTimeout(500);

    const singleBlockRenders = allLogs
      .slice(logsBefore)
      .filter((log) => log.includes("SingleBlock")).length;

    const blockLineRenders = allLogs
      .slice(logsBefore)
      .filter((log) => log.includes("BlockLine")).length;

    console.log("=== Text Selection Re-renders ===");
    console.log(`SingleBlock re-renders: ${singleBlockRenders}`);
    console.log(`BlockLine re-renders: ${blockLineRenders}`);
    console.log(`Total logs during test: ${allLogs.length - logsBefore}`);

    await page.screenshot({
      path: "e2e/screenshots/text-editor-selection.png",
      fullPage: true,
    });

    // During selection, only blocks that contain the selection should re-render
    // With 50 blocks and selection spanning 5 lines, we should see far fewer than 50 * 5 = 250 re-renders
  });

  test("measure SingleBlock re-renders during typing", async ({ page }) => {
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("http://localhost:5620/#/components/editor/text-editor-perf");
    await page.waitForTimeout(2000);

    await page.waitForSelector("svg text", { timeout: 10000 });

    const editor = page.locator("div:has(> div > svg)").first();
    const box = await editor.boundingBox();
    if (!box) throw new Error("Could not get editor bounding box");

    // Click to focus
    await page.mouse.click(box.x + 50, box.y + 30);
    await page.waitForTimeout(200);

    const logsBefore = allLogs.length;

    // Type some characters
    await page.keyboard.type("Hello");
    await page.waitForTimeout(500);

    const singleBlockRenders = allLogs
      .slice(logsBefore)
      .filter((log) => log.includes("SingleBlock")).length;

    const blockLineRenders = allLogs
      .slice(logsBefore)
      .filter((log) => log.includes("BlockLine")).length;

    console.log("=== Typing Re-renders ===");
    console.log(`SingleBlock re-renders: ${singleBlockRenders}`);
    console.log(`BlockLine re-renders: ${blockLineRenders}`);
    console.log(`Total logs during test: ${allLogs.length - logsBefore}`);

    await page.screenshot({
      path: "e2e/screenshots/text-editor-typing.png",
      fullPage: true,
    });

    // When typing, only the block being edited should re-render
    // With 5 characters typed, we expect close to 5 SingleBlock renders (for the edited block)
    // Not 50 * 5 = 250 renders
  });

  test("count SVG elements in editor", async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/editor/text-editor-perf");
    await page.waitForSelector("svg text", { timeout: 10000 });

    const elementCounts = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      if (!svg) return { error: "No SVG found" };

      const counts: Record<string, number> = {};
      const countElements = (el: Element) => {
        const tag = el.tagName.toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
        Array.from(el.children).forEach(countElements);
      };

      countElements(svg);
      return counts;
    });

    console.log("=== SVG Element Counts ===");
    console.log(JSON.stringify(elementCounts, null, 2));

    // Count total text elements (lines)
    const textElements = await page.evaluate(() => {
      return document.querySelectorAll("svg text").length;
    });
    console.log(`Total <text> elements: ${textElements}`);

    // Count tspan elements (tokens within lines)
    const tspanElements = await page.evaluate(() => {
      return document.querySelectorAll("svg tspan").length;
    });
    console.log(`Total <tspan> elements: ${tspanElements}`);
  });
});
