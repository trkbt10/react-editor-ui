/**
 * @file TextEditor overflow detection test
 *
 * Verifies that SVG/Canvas does not overflow the editor container.
 */

import { test, expect } from "@playwright/test";

test.describe("TextEditor Overflow Detection", () => {
  test("SVG should not overflow at narrow viewport width", async ({ page }) => {
    // Set narrow viewport to trigger overflow
    await page.setViewportSize({ width: 600, height: 600 });
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");

    // Find the first editor container
    const editorContainer = page.locator("div[style*='height: 200']").first();
    const svg = editorContainer.locator("svg").first();

    const containerBox = await editorContainer.boundingBox();
    const svgBox = await svg.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(svgBox).not.toBeNull();

    if (containerBox && svgBox) {
      console.log("Narrow viewport - Container:", containerBox);
      console.log("Narrow viewport - SVG:", svgBox);

      // SVG width should adapt to container width
      expect(svgBox.width).toBeLessThanOrEqual(containerBox.width);
    }
  });

  test("SVG should not overflow the editor container horizontally", async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");

    // Find the first editor container (With Rich Text Styles section)
    const editorContainer = page.locator("div[style*='height: 200']").first();
    const svg = editorContainer.locator("svg").first();

    // Get bounding boxes
    const containerBox = await editorContainer.boundingBox();
    const svgBox = await svg.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(svgBox).not.toBeNull();

    if (containerBox && svgBox) {
      // Log for debugging
      console.log("Container:", containerBox);
      console.log("SVG:", svgBox);

      // SVG width should not exceed container width
      expect(svgBox.width).toBeLessThanOrEqual(containerBox.width);

      // SVG right edge should not exceed container right edge
      const containerRight = containerBox.x + containerBox.width;
      const svgRight = svgBox.x + svgBox.width;
      expect(svgRight).toBeLessThanOrEqual(containerRight + 1); // +1 for rounding tolerance
    }
  });

  test("SVG width attribute should not be hardcoded larger than container", async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");

    // Get the SVG width attribute
    const svg = page.locator("div[style*='height: 200'] svg").first();
    const svgWidth = await svg.getAttribute("width");

    console.log("SVG width attribute:", svgWidth);

    // Get container computed width
    const container = page.locator("div[style*='height: 200']").first();
    const containerWidth = await container.evaluate((el) => el.clientWidth);

    console.log("Container clientWidth:", containerWidth);

    // SVG width should not be a hardcoded value larger than container
    if (svgWidth) {
      const svgWidthNum = parseFloat(svgWidth);
      expect(svgWidthNum).toBeLessThanOrEqual(containerWidth);
    }
  });

  test("Canvas renderer should not overflow at narrow viewport width", async ({ page }) => {
    // Set narrow viewport
    await page.setViewportSize({ width: 600, height: 600 });
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");

    // Switch to Canvas renderer
    const canvasButton = page.locator("button", { hasText: "Canvas" });
    await canvasButton.click();

    // Wait for canvas to render
    await page.waitForSelector("canvas");
    await page.waitForTimeout(100);

    // Find the first editor container
    const editorContainer = page.locator("div[style*='height: 200']").first();
    const canvas = editorContainer.locator("canvas").first();

    const containerBox = await editorContainer.boundingBox();
    const canvasBox = await canvas.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();

    if (containerBox && canvasBox) {
      console.log("Canvas - Container:", containerBox);
      console.log("Canvas - Canvas:", canvasBox);

      // Canvas width should adapt to container width
      expect(canvasBox.width).toBeLessThanOrEqual(containerBox.width);
    }
  });

  test("editor should not have horizontal scrollbar unless content is wide", async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");

    // Check for overflow in the code area
    const codeArea = page.locator("div[style*='height: 200'] > div").first();

    const overflowInfo = await codeArea.evaluate((el) => {
      const hasHorizontalScroll = el.scrollWidth > el.clientWidth + 1;
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        hasHorizontalScroll,
      };
    });

    console.log("Overflow info:", overflowInfo);

    // For the demo text which is short, there should be no horizontal overflow
    expect(overflowInfo.hasHorizontalScroll).toBe(false);
  });
});
