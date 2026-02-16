/**
 * @file Visual regression tests for Editor components
 *
 * Uses Playwright's screenshot comparison to detect visual regressions
 * in text positioning, styling, and rendering.
 *
 * Run with: npx playwright test e2e/visual-editor.spec.ts
 * Update snapshots: npx playwright test e2e/visual-editor.spec.ts --update-snapshots
 */

import { test, expect } from "@playwright/test";

/**
 * Get the editor SVG element (not icon SVGs).
 * Editor SVG contains text/tspan elements for code rendering.
 */
function getEditorSvg(page: import("@playwright/test").Page) {
  return page.locator("svg:has(text)").first();
}

/**
 * Get the editor container div for clicking.
 */
function getEditorContainer(page: import("@playwright/test").Page) {
  return page.locator("div:has(> svg:has(text))").first();
}

test.describe("Visual Regression: Editor", () => {
  test.describe("CodeEditor", () => {
    test("JSON syntax highlighting renders correctly", async ({ page }) => {
      await page.goto("/#/components/editor/code-editor");
      await page.waitForSelector("svg text");

      const editorSvg = getEditorSvg(page);
      await expect(editorSvg).toHaveScreenshot("code-editor-json.png");
    });
  });

  test.describe("TextEditor", () => {
    test("rich text with variable font sizes renders correctly", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg text");

      const editorSvg = getEditorSvg(page);
      await expect(editorSvg).toHaveScreenshot("text-editor-styled.png");
    });

    test("character positions are calculated correctly with mixed styles", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg text");

      // Verify tspan x-positions are set (style-aware positioning)
      const tspans = page.locator("svg tspan[x]");
      const count = await tspans.count();

      // Should have multiple positioned tspan elements
      expect(count).toBeGreaterThan(1);

      const editorSvg = getEditorSvg(page);
      await expect(editorSvg).toHaveScreenshot("text-editor-positions.png");
    });

    test("cursor position aligns with styled text", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg text");

      // Click in the editor container to place cursor
      const editorContainer = getEditorContainer(page);
      await editorContainer.click({ position: { x: 100, y: 20 }, force: true });

      // Wait for cursor to render
      await page.waitForTimeout(100);

      const editorSvg = getEditorSvg(page);
      await expect(editorSvg).toHaveScreenshot("text-editor-cursor.png", {
        maxDiffPixelRatio: 0.01,
      });
    });

    test("selection highlight aligns with styled text", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg text");

      // Select text by clicking and dragging in the container
      const editorContainer = getEditorContainer(page);
      const box = await editorContainer.boundingBox();

      if (box) {
        await page.mouse.move(box.x + 10, box.y + 15);
        await page.mouse.down();
        await page.mouse.move(box.x + 150, box.y + 15);
        await page.mouse.up();
      }

      // Wait for selection to render
      await page.waitForTimeout(100);

      const editorSvg = getEditorSvg(page);
      await expect(editorSvg).toHaveScreenshot("text-editor-selection.png", {
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  test.describe("Style Rendering", () => {
    test("bold text renders with correct weight", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg");

      // Verify bold tspan exists
      const boldTspan = page.locator('svg tspan[font-weight="bold"]');
      expect(await boldTspan.count()).toBeGreaterThan(0);
    });

    test("colored text renders with correct fill", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg");

      // Verify colored tspan exists (brown color from demo: #a52a2a)
      const coloredTspan = page.locator('svg tspan[fill="#a52a2a"]');
      expect(await coloredTspan.count()).toBeGreaterThan(0);
    });

    test("different font sizes render correctly", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg");

      // Verify sized tspan exists (18px from demo)
      const sizedTspan = page.locator('svg tspan[font-size="18px"]');
      expect(await sizedTspan.count()).toBeGreaterThan(0);
    });

    test("different font families render correctly", async ({ page }) => {
      await page.goto("/#/components/editor/text-editor");
      await page.waitForSelector("svg");

      // Verify font-family tspan exists (Georgia from demo)
      const fontFamilyTspan = page.locator('svg tspan[font-family*="Georgia"]');
      expect(await fontFamilyTspan.count()).toBeGreaterThan(0);
    });
  });
});
