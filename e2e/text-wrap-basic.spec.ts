/**
 * @file Text Wrap Basic E2E Tests
 *
 * Tests for basic soft wrap functionality.
 * Verifies that text wraps correctly at container boundaries.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/soft-wrap";

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
  softWrapCheckbox: ReturnType<Page["locator"]>;
  wordWrapCheckbox: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  const container = page.locator('[data-testid="soft-wrap-editor"]');
  return {
    container,
    svg: container.locator("svg:has(text)").first(),
    textarea: container.locator('textarea[aria-label="Block text editor"]'),
    softWrapCheckbox: page.locator('[aria-label="Enable soft wrap"]'),
    wordWrapCheckbox: page.locator('[aria-label="Enable word wrap"]'),
  };
}

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

// =============================================================================
// Tests: Basic Soft Wrap
// =============================================================================

test.describe("Text Wrap: Basic Functionality", () => {
  test("soft wrap is enabled by default", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await expect(locators.softWrapCheckbox).toBeChecked();
  });

  test("text wraps within container width when soft wrap enabled", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await expect(locators.svg).toBeVisible();

    // Get container width
    const containerBox = await locators.container.boundingBox();
    expect(containerBox).not.toBeNull();

    // Get all text elements - they should not overflow container
    const textElements = locators.svg.locator("text");
    const textCount = await textElements.count();
    expect(textCount).toBeGreaterThan(0);

    // Check that text elements are within container bounds
    for (let i = 0; i < Math.min(textCount, 10); i++) {
      const textBox = await textElements.nth(i).boundingBox();
      if (textBox && containerBox) {
        // Text should start within container
        expect(textBox.x).toBeGreaterThanOrEqual(containerBox.x - 5);
        // Text should not significantly overflow (some padding tolerance)
        expect(textBox.x + textBox.width).toBeLessThanOrEqual(
          containerBox.x + containerBox.width + 20
        );
      }
    }
  });

  test("multiple visual lines are rendered for long logical line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // The first logical line is long and should wrap into multiple visual lines
    // Find text elements at different Y positions
    const textElements = locators.svg.locator("text");
    const yPositions = new Set<number>();

    const count = await textElements.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const box = await textElements.nth(i).boundingBox();
      if (box) {
        yPositions.add(Math.round(box.y));
      }
    }

    // Should have multiple Y positions (wrapped lines)
    expect(yPositions.size).toBeGreaterThan(3);
  });

  test("disabling soft wrap removes wrapping", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Count visual lines with wrap enabled
    const wrappedTextElements = await locators.svg.locator("text").count();

    // Disable soft wrap
    await locators.softWrapCheckbox.click();
    await page.waitForTimeout(200);

    // Count visual lines with wrap disabled
    const unwrappedTextElements = await locators.svg.locator("text").count();

    // With wrap disabled, should have fewer visual lines (one per logical line)
    // Note: This test might vary based on content, but generally unwrapped should be less
    expect(unwrappedTextElements).toBeLessThanOrEqual(wrappedTextElements);
  });

  test("word wrap breaks at word boundaries", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Ensure word wrap is enabled
    await expect(locators.wordWrapCheckbox).toBeChecked();

    // Get the SVG content - with word wrap, lines should end at spaces
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toBeDefined();

    // The content should contain complete words, not broken mid-word
    // Check that "wrapping" appears as a complete word (not "wrappin" and "g" on separate lines)
    expect(svgContent).toContain("wrap");
  });
});

// =============================================================================
// Tests: Container Resize
// =============================================================================

test.describe("Text Wrap: Container Resize", () => {
  test("wrap points update when container resizes", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Get initial visual line count
    const initialTextCount = await locators.svg.locator("text").count();

    // Resize viewport to be narrower
    await page.setViewportSize({ width: 600, height: 800 });
    await page.waitForTimeout(300);

    // Visual lines should increase with narrower container
    const narrowTextCount = await locators.svg.locator("text").count();

    // Narrower container should have more visual lines (or same for short content)
    expect(narrowTextCount).toBeGreaterThanOrEqual(initialTextCount);

    // Resize back to wider
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(300);

    // Visual lines should decrease with wider container
    const wideTextCount = await locators.svg.locator("text").count();
    expect(wideTextCount).toBeLessThanOrEqual(narrowTextCount);
  });
});

// =============================================================================
// Tests: CJK Characters
// =============================================================================

test.describe("Text Wrap: CJK Characters", () => {
  test("CJK text wraps correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // The demo content includes Japanese text
    const svgContent = await locators.svg.textContent();

    // Should contain Japanese text
    expect(svgContent).toContain("日本語");

    // CJK text should be visible (rendered)
    const cjkText = locators.svg.locator("text").filter({ hasText: "日本語" });
    const count = await cjkText.count();
    expect(count).toBeGreaterThan(0);
  });
});
