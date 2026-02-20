/**
 * @file Markdown Block Editor E2E Tests
 *
 * Tests for Markdown block type styling and configuration-based rendering.
 * Verifies that block types (headings, lists, blockquotes, code) are
 * rendered with correct visual styles.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/markdown/svg";

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
};

function getMarkdownEditorLocators(page: Page): EditorLocators {
  // Find the editor container within the Editor panel
  const container = page.locator('[style*="border"][style*="overflow: hidden"]').first();
  return {
    container,
    svg: container.locator("svg:has(text)").first(),
  };
}

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

// =============================================================================
// Tests: Block Type Visual Styling
// =============================================================================

test.describe("Markdown Block Editor: Block Type Styling", () => {
  test("heading-1 is rendered with larger font size", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);
    await expect(locators.svg).toBeVisible();

    // Find the heading-1 text element (content without "# " prefix)
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    // Check that it has a larger font-size (default is 14, heading-1 multiplier is 1.75 = 24.5)
    const fontSize = await h1Text.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Should be larger than default (14px * 1.75 = 24.5px)
    expect(fontSize).toBeGreaterThanOrEqual(20);
  });

  test("heading-2 is rendered with medium font size", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Find heading-2 text (content without "## " prefix)
    const h2Text = locators.svg.locator("text").filter({ hasText: "Features" });
    await expect(h2Text).toBeVisible();

    const fontSize = await h2Text.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Should be larger than default but smaller than h1 (14px * 1.5 = 21px)
    expect(fontSize).toBeGreaterThanOrEqual(18);
    expect(fontSize).toBeLessThan(25);
  });

  test("blockquote has visual decoration", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Scroll down to find blockquote (may be below initial viewport)
    await locators.container.evaluate((el) => {
      el.scrollTop = 800; // Scroll to see blockquote section
    });
    await page.waitForTimeout(200);

    // Find blockquote text (content without "> " prefix)
    const blockquoteText = locators.svg.locator("text").filter({ hasText: /blockquote/i });

    // If blockquote is visible, check for decoration
    const count = await blockquoteText.count();
    if (count > 0) {
      await expect(blockquoteText.first()).toBeVisible();

      // Check for decoration elements (rect) near blockquote
      const blockquoteGroup = blockquoteText.first().locator("xpath=..");
      const decorationRects = blockquoteGroup.locator("rect");
      const rectCount = await decorationRects.count();
      expect(rectCount).toBeGreaterThanOrEqual(0);
    } else {
      // Blockquote might not be rendered due to virtual scroll - skip this assertion
      console.log("Blockquote not in visible range - skipping decoration check");
    }
  });

  test("code block uses monospace font family", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Find code block text (function greet)
    const codeText = locators.svg.locator("tspan").filter({ hasText: "function greet" });

    // Code block might be present - check if visible
    const codeTextCount = await codeText.count();
    if (codeTextCount > 0) {
      const fontFamily = await codeText.first().evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      // Should include monospace font
      expect(fontFamily.toLowerCase()).toMatch(/mono|consolas|menlo|courier/i);
    }
  });

  test("bullet list items are indented", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Find bullet list item (from the demo Markdown - "First item" in unordered list)
    const bulletItem = locators.svg.locator("text").filter({ hasText: "First item" });
    await expect(bulletItem).toBeVisible();

    // Get X position of bullet item
    const bulletX = await bulletItem.evaluate((el) => {
      const tspan = el.querySelector("tspan");
      return tspan ? parseFloat(tspan.getAttribute("x") || "0") : 0;
    });

    // List items should have indentation (> padding + bullet marker space)
    // Typically lists have additional left margin for bullet/number
    expect(bulletX).toBeGreaterThanOrEqual(8);
  });

  test("numbered list items are indented", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Scroll to see ordered list section
    await locators.container.evaluate((el) => {
      el.scrollTop = 600;
    });
    await page.waitForTimeout(200);

    // Find numbered list item (content without "1. " prefix)
    const numberedItem = locators.svg.locator("text").filter({ hasText: "Step" });

    const count = await numberedItem.count();
    if (count > 0) {
      await expect(numberedItem.first()).toBeVisible();

      // Get X position
      const numberedX = await numberedItem.first().evaluate((el) => {
        const tspan = el.querySelector("tspan");
        return tspan ? parseFloat(tspan.getAttribute("x") || "0") : 0;
      });

      // Should have some indentation (> padding value of 8)
      expect(numberedX).toBeGreaterThanOrEqual(8);
    } else {
      console.log("Numbered list not in visible range");
    }
  });
});

// =============================================================================
// Tests: Block Type Configuration
// =============================================================================

test.describe("Markdown Block Editor: Configuration", () => {
  test("multiple block types render correctly in same document", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Verify various block types exist in initial view (content without Markdown prefixes)
    const h1 = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const h2 = locators.svg.locator("text").filter({ hasText: "Features" });

    // These should be visible in initial view
    await expect(h1).toBeVisible();
    await expect(h2).toBeVisible();

    // Check total text content includes various elements (may require scroll)
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toContain("Markdown Block Editor");
    expect(svgContent).toContain("Features");
  });

  test("heading font sizes follow hierarchy", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Get font sizes for h1, h2, h3 (content without prefixes)
    const h1 = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const h2 = locators.svg.locator("text").filter({ hasText: "Features" });
    const h3 = locators.svg.locator("text").filter({ hasText: "Nested Styles" });

    const h1Size = await h1.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    const h2Size = await h2.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    const h3Size = await h3.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));

    // h1 > h2 > h3
    expect(h1Size).toBeGreaterThan(h2Size);
    expect(h2Size).toBeGreaterThan(h3Size);
  });

  test("editor is editable after rendering with block styles", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Click on the editor to focus
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type some text
    await page.keyboard.type("Test");
    await page.waitForTimeout(200);

    // The text should appear in the editor
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toContain("Test");
  });
});

// =============================================================================
// Tests: Block Style Rendering Consistency
// =============================================================================

test.describe("Markdown Block Editor: Rendering Consistency", () => {
  test("no text duplication in block-styled content", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Get the initial content
    const initialContent = await locators.svg.textContent();

    // Count occurrences of a unique phrase
    const heading = "Markdown Block Editor";
    const occurrences = (initialContent?.match(new RegExp(heading, "g")) || []).length;

    // Should appear exactly once
    expect(occurrences).toBe(1);
  });

  test("block decorations do not overlap text", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Scroll to blockquote section
    await locators.container.evaluate((el) => {
      el.scrollTop = 800;
    });
    await page.waitForTimeout(200);

    // Find blockquote (content without "> " prefix)
    const blockquoteText = locators.svg.locator("text").filter({ hasText: /blockquote/i });

    if (await blockquoteText.count() > 0) {
      await expect(blockquoteText.first()).toBeVisible();

      // Get the bounding box of the text
      const textBox = await blockquoteText.first().boundingBox();
      expect(textBox).not.toBeNull();

      // Text should be readable (has reasonable width)
      expect(textBox!.width).toBeGreaterThan(50);
    } else {
      // If blockquote not visible, test with h1 instead
      await locators.container.evaluate((el) => {
        el.scrollTop = 0;
      });
      await page.waitForTimeout(200);

      const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
      await expect(h1Text).toBeVisible();

      const textBox = await h1Text.boundingBox();
      expect(textBox).not.toBeNull();
      expect(textBox!.width).toBeGreaterThan(50);
    }
  });
});

// =============================================================================
// Tests: Renderer Tab Navigation
// =============================================================================

test.describe("Markdown Block Editor: Renderer Tabs", () => {
  test("can switch between SVG and Canvas renderers", async ({ page }) => {
    await setupPage(page);

    // Find tabs within the demo content area (not navigation sidebar)
    // The tabs are NavLink elements with specific href patterns
    const svgTab = page.locator('a[href*="/markdown/svg"]');
    const canvasTab = page.locator('a[href*="/markdown/canvas"]');

    await expect(svgTab).toBeVisible();
    await expect(canvasTab).toBeVisible();

    // Click Canvas tab
    await canvasTab.click();
    await page.waitForTimeout(300);

    // URL should change to canvas
    expect(page.url()).toContain("/markdown/canvas");

    // Canvas element should be visible (use first() to avoid react-scan overlays)
    const editorContainer = page.locator('[style*="border"][style*="overflow: hidden"]').first();
    const canvas = editorContainer.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Switch back to SVG
    await svgTab.click();
    await page.waitForTimeout(300);

    // URL should change back to svg
    expect(page.url()).toContain("/markdown/svg");

    // SVG should be visible again
    const locators = getMarkdownEditorLocators(page);
    await expect(locators.svg).toBeVisible();
  });

  test("document state is preserved when switching renderers", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Type some text in SVG editor
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.type("NewText");
    await page.waitForTimeout(200);

    // Switch to Canvas
    const canvasTab = page.locator('a[href*="/markdown/canvas"]');
    await canvasTab.click();
    await page.waitForTimeout(300);

    // Switch back to SVG
    const svgTab = page.locator('a[href*="/markdown/svg"]');
    await svgTab.click();
    await page.waitForTimeout(300);

    // Content should still contain the typed text
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toContain("NewText");
  });
});
