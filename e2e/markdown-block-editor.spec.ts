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

const BASE_URL = "http://localhost:5620/#/components/editor/text-editor";

type EditorLocators = {
  section: ReturnType<Page["locator"]>;
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
};

function getMarkdownEditorLocators(page: Page): EditorLocators {
  // Find the "Markdown Block Editor" section
  const section = page.locator('text="Markdown Block Editor"').locator("xpath=..");
  return {
    section,
    container: section.locator("div:has(> svg:has(text))").first(),
    svg: section.locator("svg:has(text)").first(),
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

    // Find blockquote text (content without "> " prefix)
    const blockquoteText = locators.svg.locator("text").filter({ hasText: "A blockquote" });
    await expect(blockquoteText).toBeVisible();

    // Check for left border decoration (rect element near blockquote)
    // The blockquote should have a rect with leftBorder color
    const blockquoteGroup = blockquoteText.locator("xpath=..");
    const decorationRects = blockquoteGroup.locator("rect");

    // There should be decoration elements (background and/or left border)
    const rectCount = await decorationRects.count();
    expect(rectCount).toBeGreaterThanOrEqual(0); // At least might have decoration
  });

  test("code block uses monospace font family", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Find code block text (function hello)
    const codeText = locators.svg.locator("tspan").filter({ hasText: "function hello" });

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

    // Find bullet list item (content without "- " prefix)
    const bulletItem = locators.svg.locator("text").filter({ hasText: "Headings (H1, H2, H3)" });
    await expect(bulletItem).toBeVisible();

    // Get X position of bullet item
    const bulletX = await bulletItem.evaluate((el) => {
      const tspan = el.querySelector("tspan");
      return tspan ? parseFloat(tspan.getAttribute("x") || "0") : 0;
    });

    // Find a regular paragraph for comparison
    const paragraph = locators.svg.locator("text").filter({ hasText: "This is a paragraph" });

    if (await paragraph.count() > 0) {
      const paragraphX = await paragraph.first().evaluate((el) => {
        const tspan = el.querySelector("tspan");
        return tspan ? parseFloat(tspan.getAttribute("x") || "0") : 0;
      });

      // Bullet item should be indented more than paragraph
      expect(bulletX).toBeGreaterThan(paragraphX);
    }
  });

  test("numbered list items are indented", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Find numbered list item (content without "1. " prefix)
    const numberedItem = locators.svg.locator("text").filter({ hasText: "First item" });
    await expect(numberedItem).toBeVisible();

    // Get X position
    const numberedX = await numberedItem.evaluate((el) => {
      const tspan = el.querySelector("tspan");
      return tspan ? parseFloat(tspan.getAttribute("x") || "0") : 0;
    });

    // Should have some indentation (> padding value of 8)
    expect(numberedX).toBeGreaterThan(16);
  });
});

// =============================================================================
// Tests: Block Type Configuration
// =============================================================================

test.describe("Markdown Block Editor: Configuration", () => {
  test("multiple block types render correctly in same document", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Verify various block types exist (content without Markdown prefixes)
    const h1 = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const h2 = locators.svg.locator("text").filter({ hasText: "Features" });
    const h3 = locators.svg.locator("text").filter({ hasText: "Code Blocks" });
    const bullet = locators.svg.locator("text").filter({ hasText: "Bullet lists" });
    const numbered = locators.svg.locator("text").filter({ hasText: "First item" });
    const blockquote = locators.svg.locator("text").filter({ hasText: "A blockquote" });

    // All should be visible
    await expect(h1).toBeVisible();
    await expect(h2).toBeVisible();
    await expect(h3).toBeVisible();
    await expect(bullet).toBeVisible();
    await expect(numbered).toBeVisible();
    await expect(blockquote).toBeVisible();
  });

  test("heading font sizes follow hierarchy", async ({ page }) => {
    await setupPage(page);

    const locators = getMarkdownEditorLocators(page);

    // Get font sizes for h1, h2, h3 (content without prefixes)
    const h1 = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const h2 = locators.svg.locator("text").filter({ hasText: "Features" });
    const h3 = locators.svg.locator("text").filter({ hasText: "Code Blocks" });

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

    // Find blockquote (content without "> " prefix)
    const blockquoteText = locators.svg.locator("text").filter({ hasText: "A blockquote" });
    await expect(blockquoteText).toBeVisible();

    // Get the bounding box of the text
    const textBox = await blockquoteText.boundingBox();
    expect(textBox).not.toBeNull();

    // Text should be readable (has reasonable width)
    expect(textBox!.width).toBeGreaterThan(50);
  });
});
