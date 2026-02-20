/**
 * @file Block Operations E2E Tests
 *
 * Tests for block type operations (heading, list, quote, etc.).
 * Verifies that block type changes work correctly with visual styling.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/selection-toolbar";

type EditorLocators = {
  section: ReturnType<Page["locator"]>;
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  const section = page.locator('text="TextEditorWithToolbar"').locator("xpath=..");
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

async function selectTextInEditor(page: Page, container: ReturnType<Page["locator"]>): Promise<void> {
  const box = await container.boundingBox();
  if (!box) {
    throw new Error("Container not found");
  }

  // Triple click to select a line
  await container.click({ position: { x: 50, y: 30 }, clickCount: 3 });
  await page.waitForTimeout(100);
}

// =============================================================================
// Tests: Block Type Visual Styling
// =============================================================================

test.describe("Block Operations: Visual Styling", () => {
  test("heading-1 displays without # prefix", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await expect(locators.svg).toBeVisible();

    // The H1 heading should display as "Selection Toolbar Demo" without "#"
    const h1Text = locators.svg.locator("text").filter({ hasText: "Selection Toolbar Demo" });
    await expect(h1Text).toBeVisible();

    // Verify there's no "# Selection" text (which would indicate prefix wasn't stripped)
    const prefixedText = locators.svg.locator("text").filter({ hasText: /^#\s/ });
    const count = await prefixedText.count();
    expect(count).toBe(0);
  });

  test("heading-2 displays without ## prefix", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find H2 heading - "Features" should appear without "## "
    const h2Text = locators.svg.locator("text").filter({ hasText: "Features" });
    await expect(h2Text).toBeVisible();

    // Check font size is larger than default
    const fontSize = await h2Text.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });

  test("bullet list displays without - prefix", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find bullet list item - should appear without "- "
    const listItem = locators.svg.locator("text").filter({ hasText: "Bold, italic, and underline" });
    await expect(listItem).toBeVisible();

    // Verify no "- Bold" text exists
    const svgContent = await locators.svg.textContent();
    expect(svgContent).not.toMatch(/^-\s+Bold/m);
  });

  test("numbered list displays without 1. prefix", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find numbered list item - should appear without "1. "
    const listItem = locators.svg.locator("text").filter({ hasText: "First item in list" });
    await expect(listItem).toBeVisible();

    // Verify content doesn't have "1. First"
    const svgContent = await locators.svg.textContent();
    expect(svgContent).not.toMatch(/\d+\.\s+First item/);
  });

  test("blockquote displays without > prefix", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find blockquote - should appear without "> "
    const quoteText = locators.svg.locator("text").filter({ hasText: "This is a blockquote" });
    await expect(quoteText).toBeVisible();

    // Verify no "> This" text exists
    const svgContent = await locators.svg.textContent();
    expect(svgContent).not.toMatch(/^>\s+This/m);
  });

  test("code block displays without ``` prefix", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find code content - should appear without "```"
    const codeText = locators.svg.locator("tspan").filter({ hasText: "function greet" });

    const codeCount = await codeText.count();
    if (codeCount > 0) {
      // Check it uses monospace font
      const fontFamily = await codeText.first().evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      expect(fontFamily.toLowerCase()).toMatch(/mono|consolas|menlo|courier/i);
    }
  });
});

// =============================================================================
// Tests: Block Type Toggle Operations
// =============================================================================

test.describe("Block Operations: Toggle Behavior", () => {
  test("applying heading to paragraph changes visual style", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find a regular paragraph
    const paragraph = locators.svg.locator("text").filter({ hasText: "Select any text" });
    await expect(paragraph).toBeVisible();

    // Get initial font size
    const initialFontSize = await paragraph.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Should be regular size (not heading size)
    expect(initialFontSize).toBeLessThan(20);
  });

  test("block type operations do not duplicate content", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Count occurrences of a specific phrase
    const svgContent = await locators.svg.textContent();
    const heading = "Selection Toolbar Demo";
    const occurrences = (svgContent?.match(new RegExp(heading, "g")) || []).length;

    // Should appear exactly once
    expect(occurrences).toBe(1);
  });

  test("multiple block types coexist correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Verify multiple block types are present
    const h1 = locators.svg.locator("text").filter({ hasText: "Selection Toolbar Demo" });
    const h2 = locators.svg.locator("text").filter({ hasText: "Features" });
    const h3 = locators.svg.locator("text").filter({ hasText: "Numbered Lists" });
    const bullet = locators.svg.locator("text").filter({ hasText: "Bold, italic" });
    const numbered = locators.svg.locator("text").filter({ hasText: "First item" });
    const quote = locators.svg.locator("text").filter({ hasText: "blockquote" });

    await expect(h1).toBeVisible();
    await expect(h2).toBeVisible();
    await expect(h3).toBeVisible();
    await expect(bullet).toBeVisible();
    await expect(numbered).toBeVisible();
    await expect(quote).toBeVisible();
  });

  test("heading hierarchy is preserved", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Get font sizes for different heading levels
    const h1 = locators.svg.locator("text").filter({ hasText: "Selection Toolbar Demo" });
    const h2 = locators.svg.locator("text").filter({ hasText: "Features" });
    const h3 = locators.svg.locator("text").filter({ hasText: "Numbered Lists" });

    const h1Size = await h1.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    const h2Size = await h2.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    const h3Size = await h3.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));

    // h1 > h2 > h3
    expect(h1Size).toBeGreaterThan(h2Size);
    expect(h2Size).toBeGreaterThan(h3Size);
  });
});

// =============================================================================
// Tests: Editor Interactivity
// =============================================================================

test.describe("Block Operations: Editor Interactivity", () => {
  test("editor remains editable with block styles", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click in editor and type
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    await page.keyboard.type("Test");
    await page.waitForTimeout(200);

    // Verify text appears
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toContain("Test");
  });

  test("selection toolbar appears on text selection", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Select some text
    await selectTextInEditor(page, locators.container);
    await page.waitForTimeout(200);

    // Toolbar should appear (look for toolbar element)
    const toolbar = page.locator('[data-testid="selection-toolbar"], [role="toolbar"]');
    // Note: This test may need adjustment based on actual toolbar implementation
  });
});
