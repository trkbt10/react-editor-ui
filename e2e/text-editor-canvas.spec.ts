/**
 * @file E2E tests for TextEditor Canvas renderer
 *
 * Tests that the Canvas rendering mode works correctly:
 * - Canvas element is rendered with correct dimensions
 * - Text content is properly drawn
 * - Multi-line content has correct height
 *
 * Run with: npx playwright test e2e/text-editor-canvas.spec.ts
 */

import { test, expect } from "@playwright/test";

test.describe("TextEditor Canvas Renderer", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TextEditor demo page
    await page.goto("/#/components/editor/text-editor");

    // Wait for page to load and SVG editor to render (with extended timeout for cold start)
    await page.waitForSelector("svg text", { timeout: 60000 });

    // Click Canvas button to switch renderer
    const canvasButton = page.getByRole("button", { name: "Canvas" });
    await canvasButton.click();

    // Wait for canvas to appear
    await page.waitForSelector("canvas", { timeout: 10000 });
  });

  test("canvas element is rendered when Canvas renderer is selected", async ({
    page,
  }) => {
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("canvas has correct dimensions for multi-line content", async ({
    page,
  }) => {
    const canvas = page.locator("canvas").first();

    // Get canvas CSS dimensions
    const dimensions = await canvas.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        cssWidth: parseFloat(style.width),
        cssHeight: parseFloat(style.height),
        attrWidth: el.width,
        attrHeight: el.height,
      };
    });

    // CSS height should be greater than one line (21px)
    // Demo content has 5 lines, so height should be ~105px (5 * 21)
    expect(dimensions.cssHeight).toBeGreaterThan(21);

    // Canvas attribute height should be CSS height * devicePixelRatio
    // (usually 2 on retina displays, 1 on regular)
    const expectedMinAttrHeight = dimensions.cssHeight; // At minimum, without DPR scaling
    expect(dimensions.attrHeight).toBeGreaterThanOrEqual(expectedMinAttrHeight);
  });

  test("canvas attribute height matches CSS height times DPR", async ({
    page,
  }) => {
    const canvas = page.locator("canvas").first();

    const { cssHeight, attrHeight, dpr } = await canvas.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        cssHeight: parseFloat(style.height),
        attrHeight: el.height,
        dpr: window.devicePixelRatio || 1,
      };
    });

    // Canvas internal height should be CSS height * DPR (for sharp rendering)
    const expectedAttrHeight = cssHeight * dpr;

    // Allow some tolerance for rounding
    expect(attrHeight).toBeCloseTo(expectedAttrHeight, 0);
  });

  test("canvas has non-zero width", async ({ page }) => {
    const canvas = page.locator("canvas").first();

    const dimensions = await canvas.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        cssWidth: parseFloat(style.width),
        attrWidth: el.width,
      };
    });

    expect(dimensions.cssWidth).toBeGreaterThan(0);
    expect(dimensions.attrWidth).toBeGreaterThan(0);
  });

  test("canvas contains drawn content (non-blank)", async ({ page }) => {
    const canvas = page.locator("canvas").first();

    // Check if canvas has any non-transparent pixels (content was drawn)
    const hasContent = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx) return false;

      // Sample a region of the canvas
      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      const data = imageData.data;

      // Check if any pixel is non-transparent (alpha > 0)
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
          return true;
        }
      }
      return false;
    });

    expect(hasContent).toBe(true);
  });

  test("switching between SVG and Canvas renderers works", async ({ page }) => {
    // Get the first editor container (div containing canvas or svg)
    const editorContainer = page.locator("div:has(> canvas)").first();

    // Currently in Canvas mode (from beforeEach)
    await expect(editorContainer.locator("canvas")).toBeVisible();

    // Switch back to SVG
    const svgButton = page.getByRole("button", { name: "SVG" });
    await svgButton.click();

    // Wait for SVG to appear
    await page.waitForSelector("svg text", { timeout: 5000 });

    // SVG should now be visible
    const svgEditor = page.locator("svg:has(text)").first();
    await expect(svgEditor).toBeVisible();

    // Switch to Canvas again
    const canvasButton = page.getByRole("button", { name: "Canvas" });
    await canvasButton.click();

    // Wait for canvas to appear
    await page.waitForSelector("canvas", { timeout: 5000 });

    // Canvas should be visible again
    await expect(page.locator("canvas").first()).toBeVisible();
  });

  test("all TextEditor sections render with Canvas", async ({ page }) => {
    // The demo has multiple TextEditor sections
    // After switching to Canvas mode, all should use canvas
    const canvasElements = page.locator("canvas");
    const count = await canvasElements.count();

    // Should have at least 2 canvas elements (main editor + read-only)
    expect(count).toBeGreaterThanOrEqual(2);

    // Each canvas should have proper height
    for (let i = 0; i < count; i++) {
      const canvas = canvasElements.nth(i);
      const cssHeight = await canvas.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).height);
      });

      // Each canvas should have height for at least some content
      expect(cssHeight).toBeGreaterThan(0);
    }
  });

  test("canvas dimensions are consistent after multiple renders", async ({
    page,
  }) => {
    // Toggle renderer multiple times to check for race conditions
    for (let i = 0; i < 3; i++) {
      // Switch to SVG
      await page.getByRole("button", { name: "SVG" }).click();
      await page.waitForSelector("svg text");

      // Switch to Canvas
      await page.getByRole("button", { name: "Canvas" }).click();
      await page.waitForSelector("canvas");
    }

    const canvas = page.locator("canvas").first();
    const dimensions = await canvas.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        cssHeight: parseFloat(style.height),
        attrHeight: el.height,
        dpr: window.devicePixelRatio || 1,
      };
    });

    // After multiple toggles, dimensions should still be correct
    expect(dimensions.cssHeight).toBeGreaterThan(21);
    expect(dimensions.attrHeight).toBeCloseTo(
      dimensions.cssHeight * dimensions.dpr,
      0
    );
  });

  test("canvas height matches content lines (5 lines = ~105px)", async ({
    page,
  }) => {
    const canvas = page.locator("canvas").first();

    const cssHeight = await canvas.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    // Demo content has 5 lines with lineHeight=21, so height should be ~105px
    const expectedHeight = 5 * 21; // 105
    const tolerance = 10; // Allow some tolerance

    expect(cssHeight).toBeGreaterThanOrEqual(expectedHeight - tolerance);
    expect(cssHeight).toBeLessThanOrEqual(expectedHeight + tolerance);
  });

  test("cursor is displayed when clicking in canvas editor", async ({
    page,
  }) => {
    // Get the editor container (parent of canvas)
    const editorContainer = page.locator("div:has(> canvas)").first();
    const canvas = page.locator("canvas").first();

    // Click in the editor to place cursor
    await editorContainer.click({ position: { x: 50, y: 20 } });

    // Wait for canvas to redraw
    await page.waitForTimeout(200);

    // Check if cursor is drawn (look for a thin vertical rectangle)
    const hasCursor = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx) return false;

      // Sample pixels to look for cursor (black vertical line at x ~50)
      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      const data = imageData.data;

      // Count black pixels that could be cursor
      let blackPixelCount = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        // Black pixel with full alpha
        if (r === 0 && g === 0 && b === 0 && a === 255) {
          blackPixelCount++;
        }
      }

      // Should have some black pixels for cursor and text
      return blackPixelCount > 10;
    });

    expect(hasCursor).toBe(true);
  });

  test("selection is displayed when selecting text in canvas editor", async ({
    page,
  }) => {
    // Get the editor container
    const editorContainer = page.locator("div:has(> canvas)").first();
    const canvas = page.locator("canvas").first();
    const box = await editorContainer.boundingBox();

    if (!box) {
      throw new Error("Could not get editor bounding box");
    }

    // Select text by dragging
    await page.mouse.move(box.x + 20, box.y + 15);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 15);
    await page.mouse.up();

    // Wait for canvas to redraw
    await page.waitForTimeout(200);

    // Check if selection highlight is drawn (blue-ish background)
    const hasSelection = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx) return false;

      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      const data = imageData.data;

      // Look for selection color (rgba(51, 144, 255, 0.3) = semi-transparent blue)
      // When blended with white, this becomes approximately rgb(179, 213, 255)
      let blueishPixelCount = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Check for blue-tinted pixels (selection highlight)
        if (a > 0 && b > r && b > g && b > 100) {
          blueishPixelCount++;
        }
      }

      // Should have significant number of blue pixels for selection
      return blueishPixelCount > 50;
    });

    expect(hasSelection).toBe(true);
  });
});
