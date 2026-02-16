/**
 * @file Drag Selection Tests
 *
 * Tests for mouse drag selection in the editor.
 */

import { test, expect } from "@playwright/test";

function getEditorContainer(page: import("@playwright/test").Page) {
  return page.locator("div:has(> svg:has(text))").first();
}

function getTextarea(page: import("@playwright/test").Page) {
  return page.locator('textarea[aria-label="Text editor"]').first();
}

function getSvg(page: import("@playwright/test").Page) {
  return page.locator("svg:has(text)").first();
}

test.describe("Drag Selection: TextEditor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");
  });

  test("debug: mouse down sets cursor position", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getTextarea(page);

    // Get bounding box
    const box = await container.boundingBox();
    expect(box).not.toBeNull();

    // Click at different positions and check cursor
    await page.mouse.click(box!.x + 20, box!.y + 15);
    await page.waitForTimeout(100);

    const pos1 = await textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);
    console.log("Position after click at x=20:", pos1);

    await page.mouse.click(box!.x + 100, box!.y + 15);
    await page.waitForTimeout(100);

    const pos2 = await textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);
    console.log("Position after click at x=100:", pos2);

    // Position should be different
    expect(pos2).toBeGreaterThan(pos1);
  });

  test("drag selection creates selection range", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getTextarea(page);

    // Replace with known text first
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    await page.waitForTimeout(200);

    // Get bounding box of container
    const box = await container.boundingBox();
    expect(box).not.toBeNull();

    // Perform drag selection from x=20 to x=100
    await page.mouse.move(box!.x + 20, box!.y + 15);
    await page.mouse.down();
    await page.mouse.move(box!.x + 100, box!.y + 15);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Check that selection exists
    const { start, end } = await textarea.evaluate((el: HTMLTextAreaElement) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
    }));

    console.log("Selection after drag:", { start, end });

    // Should have a selection (start != end)
    expect(end).toBeGreaterThan(start);
  });

  test("drag selection highlights text in SVG", async ({ page }) => {
    const container = getEditorContainer(page);
    const svg = getSvg(page);

    // Replace with known text first
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    await page.waitForTimeout(200);

    // Get bounding box
    const box = await container.boundingBox();
    expect(box).not.toBeNull();

    // Before drag - check for selection highlight rects
    const highlightsBefore = await svg.locator('rect[fill*="rgba"]').count();
    console.log("Highlights before drag:", highlightsBefore);

    // Perform drag selection
    await page.mouse.move(box!.x + 20, box!.y + 15);
    await page.mouse.down();
    await page.mouse.move(box!.x + 150, box!.y + 15);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // After drag - should have selection highlight
    const highlightsAfter = await svg.locator('rect[fill*="rgba"]').count();
    console.log("Highlights after drag:", highlightsAfter);

    // Should have at least one highlight rect
    expect(highlightsAfter).toBeGreaterThan(0);
  });

  test("drag selection can be used to replace text", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getTextarea(page);

    // Replace with known text first
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    await page.waitForTimeout(200);

    // Get bounding box
    const box = await container.boundingBox();
    expect(box).not.toBeNull();

    // Perform drag selection
    await page.mouse.move(box!.x + 20, box!.y + 15);
    await page.mouse.down();
    await page.mouse.move(box!.x + 100, box!.y + 15);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Verify selection exists
    const { start, end } = await textarea.evaluate((el: HTMLTextAreaElement) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
    }));
    console.log("Selection:", { start, end });

    // Type to replace selection
    await page.keyboard.type("XXX");
    await page.waitForTimeout(100);

    const newText = await textarea.inputValue();
    console.log("New text:", newText);

    // Should contain XXX and be shorter than original
    expect(newText).toContain("XXX");
    expect(newText.length).toBeLessThan(26); // Original was 26 chars
  });
});
