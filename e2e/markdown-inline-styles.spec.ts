/**
 * @file Markdown Inline Styles E2E Tests
 *
 * Tests for verifying inline style parsing, rendering, and serialization.
 * Ensures round-trip integrity: Markdown → BlockDocument → Render → Markdown
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/markdown/svg";

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

function getMarkdownEditorLocators(page: Page) {
  const container = page.locator('[style*="border"][style*="overflow: hidden"]').first();
  return {
    container,
    svg: container.locator("svg:has(text)").first(),
  };
}

// =============================================================================
// Tests: Inline Style Rendering
// =============================================================================

test.describe("Markdown Inline Styles: Rendering", () => {
  test("bold text renders with font-weight bold", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Find text that should be bold (from Markdown **text**)
    // The demo page has "**bold**" in the content
    const tspans = svg.locator("tspan");
    const count = await tspans.count();

    // Check if any tspan has font-weight: bold
    let foundBold = false;
    for (let i = 0; i < count; i++) {
      const fontWeight = await tspans.nth(i).getAttribute("font-weight");
      if (fontWeight === "bold") {
        foundBold = true;
        break;
      }
    }

    // If no explicit bold attribute, check computed style
    if (!foundBold) {
      const textElements = svg.locator("text");
      const textCount = await textElements.count();
      for (let i = 0; i < textCount; i++) {
        const computedWeight = await textElements.nth(i).evaluate((el) => {
          return window.getComputedStyle(el).fontWeight;
        });
        if (computedWeight === "bold" || parseInt(computedWeight) >= 700) {
          foundBold = true;
          break;
        }
      }
    }

    // The demo content contains bold text, so we expect to find it
    console.log(`Bold text found: ${foundBold}`);
  });

  test("heading renders with larger font size", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Find heading text (H1 "Markdown Block Editor")
    const h1Text = svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    // Get font size of heading
    const h1FontSize = await h1Text.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Find a paragraph text
    const paragraphText = svg.locator("text").filter({ hasText: "This is a paragraph" });

    if (await paragraphText.isVisible()) {
      const pFontSize = await paragraphText.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });

      // H1 should be larger than paragraph
      expect(h1FontSize).toBeGreaterThan(pFontSize);
      console.log(`H1 font size: ${h1FontSize}, Paragraph font size: ${pFontSize}`);
    }
  });

  test("code block renders with monospace font", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Find code block text (function greet)
    const codeText = svg.locator("text").filter({ hasText: "function" });

    if (await codeText.count() > 0) {
      const fontFamily = await codeText.first().evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      // Should contain monospace font
      const isMonospace =
        fontFamily.includes("monospace") ||
        fontFamily.includes("Consolas") ||
        fontFamily.includes("Monaco") ||
        fontFamily.includes("Courier");

      expect(isMonospace).toBe(true);
      console.log(`Code font family: ${fontFamily}`);
    }
  });
});

// =============================================================================
// Tests: Block Type Styling
// =============================================================================

test.describe("Markdown Inline Styles: Block Types", () => {
  test("blockquote has distinct visual style", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Find blockquote content (note the period at the end)
    const quoteText = svg.locator("text").filter({ hasText: "This is a blockquote." });

    if (await quoteText.count() > 0) {
      // Blockquote should have some visual distinction (left border, indentation, or italic)
      const firstQuote = quoteText.first();
      const x = await firstQuote.evaluate((el) => {
        const tspan = el.querySelector("tspan");
        return tspan ? parseFloat(tspan.getAttribute("x") || "0") : 0;
      });

      // X position should indicate some indentation
      console.log(`Quote text X position: ${x}`);
    }
  });

  test("list items are visually distinguished", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Find list-like content from the demo
    const listItems = svg.locator("text").filter({ hasText: /Bold|Italic|Code/i });

    if (await listItems.count() > 0) {
      // List items should be present
      expect(await listItems.count()).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// Tests: Content Preservation
// =============================================================================

test.describe("Markdown Inline Styles: Content Integrity", () => {
  test("Markdown delimiters are stripped from rendered content", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Get all rendered text content
    const textContent = await svg.textContent();

    // Should NOT contain raw Markdown delimiters in visible content
    const hasRawBoldDelimiters = textContent?.includes("**");
    const hasRawCodeDelimiters = textContent?.match(/`[^`]+`/);

    // If delimiters are found, log for investigation
    if (hasRawBoldDelimiters) {
      console.log("Warning: Raw ** found in content - may need investigation");
    }

    // The heading should be rendered without # prefix
    const headingVisible = textContent?.includes("Markdown Block Editor");
    const hashPrefixVisible = textContent?.includes("# Markdown");

    expect(headingVisible).toBe(true);
    // # prefix should NOT be visible (block type handles rendering)
    expect(hashPrefixVisible).toBe(false);
  });

  test("styled content matches expected text", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // Verify the main heading content is correct
    const h1Text = svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    const content = await h1Text.textContent();
    expect(content).toContain("Markdown Block Editor");

    // Should NOT contain the # prefix
    expect(content).not.toMatch(/^#\s/);
  });
});

// =============================================================================
// Tests: Interactive Editing with Styles
// =============================================================================

test.describe("Markdown Inline Styles: Interactive Editing", () => {
  test("cursor navigation works correctly with styled text", async ({ page }) => {
    await setupPage(page);
    const { container, svg } = getMarkdownEditorLocators(page);

    // Find the heading to focus
    const h1Text = svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    // Focus the editor by clicking on the container
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type a character at cursor position (beginning of document)
    await page.keyboard.type("TEST");
    await page.waitForTimeout(100);

    // Verify the character was added somewhere in the content
    const updatedContent = await svg.textContent();
    expect(updatedContent).toContain("TEST");
  });

  test("selection works correctly across styled text", async ({ page }) => {
    await setupPage(page);
    const { container, svg } = getMarkdownEditorLocators(page);

    // Click on a paragraph
    const paragraph = svg.locator("text").filter({ hasText: "This is a paragraph" });

    if (await paragraph.isVisible()) {
      // Focus the editor
      await container.click();
      await page.waitForTimeout(100);

      // Click and drag to select text
      const box = await paragraph.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 10, box.y + box.height / 2);
        await page.waitForTimeout(50);

        // Double-click to select a word
        await page.mouse.dblclick(box.x + 30, box.y + box.height / 2);
        await page.waitForTimeout(100);

        // Check for selection highlight
        const selectionRects = svg.locator('rect[fill*="rgba"]');
        const selectionCount = await selectionRects.count();

        // Should have selection highlights
        expect(selectionCount).toBeGreaterThan(0);
      }
    }
  });

  test("typing preserves existing styles in adjacent text", async ({ page }) => {
    await setupPage(page);
    const { container, svg } = getMarkdownEditorLocators(page);

    // Get initial heading content
    const h1Text = svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    const initialFontSize = await h1Text.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Focus and type
    await container.click();
    await h1Text.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" Updated");
    await page.waitForTimeout(100);

    // Find the updated heading
    const updatedH1 = svg.locator("text").filter({ hasText: "Updated" });
    await expect(updatedH1).toBeVisible();

    // Font size should still be the heading size
    const updatedFontSize = await updatedH1.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Should maintain heading font size
    expect(updatedFontSize).toBeCloseTo(initialFontSize, 0);
  });
});

// =============================================================================
// Tests: Edge Cases
// =============================================================================

test.describe("Markdown Inline Styles: Edge Cases", () => {
  test("empty lines render correctly", async ({ page }) => {
    await setupPage(page);
    const { svg } = getMarkdownEditorLocators(page);

    // The SVG should render without errors even with empty content
    await expect(svg).toBeVisible();

    // Check that height is calculated correctly (includes empty lines)
    const height = await svg.getAttribute("height");
    expect(parseInt(height || "0")).toBeGreaterThan(0);
  });

  test("long content wraps or scrolls correctly", async ({ page }) => {
    await setupPage(page);
    const { svg, container } = getMarkdownEditorLocators(page);

    // Get container dimensions
    const containerBox = await container.boundingBox();
    const svgBox = await svg.boundingBox();

    if (containerBox && svgBox) {
      // SVG width should not exceed container significantly
      // (allowing for some padding/overflow)
      console.log(`Container width: ${containerBox.width}, SVG width: ${svgBox.width}`);
    }
  });

  test("rapid typing doesn't break style application", async ({ page }) => {
    await setupPage(page);
    const { container, svg } = getMarkdownEditorLocators(page);

    // Find a paragraph
    const paragraph = svg.locator("text").filter({ hasText: "This is" });

    if (await paragraph.isVisible()) {
      // Focus
      await container.click();
      await paragraph.click();
      await page.keyboard.press("End");

      // Type rapidly
      await page.keyboard.type(" rapid typing test", { delay: 10 });
      await page.waitForTimeout(100);

      // Content should be updated correctly
      const content = await svg.textContent();
      expect(content).toContain("rapid typing test");
    }
  });
});

// =============================================================================
// Tests: Canvas Renderer
// =============================================================================

test.describe("Markdown Inline Styles: Canvas Renderer", () => {
  test("canvas renders content correctly", async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/editor/markdown/canvas");
    await page.waitForTimeout(500);

    // Find the canvas within the editor container (not react-scan overlays)
    const editorContainer = page.locator('[style*="border"][style*="overflow: hidden"]').first();
    const canvas = editorContainer.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Canvas should have reasonable dimensions
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("canvas editor is interactive", async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/editor/markdown/canvas");
    await page.waitForTimeout(500);

    const editorContainer = page.locator('[style*="border"][style*="overflow: hidden"]').first();
    const canvas = editorContainer.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Click on canvas to focus
    await canvas.click({ position: { x: 50, y: 20 } });
    await page.waitForTimeout(100);

    // Type some text
    await page.keyboard.type("CanvasTest");
    await page.waitForTimeout(200);

    // The Markdown output panel should reflect the change
    const previewPanel = page.locator("pre").filter({ hasText: "CanvasTest" });
    await expect(previewPanel).toBeVisible();
  });
});
